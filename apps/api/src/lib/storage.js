import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { allowsContentType } from '@carvo/shared'
import { AppError } from './errors.js'
import { logger } from './logger.js'
import { SNIFF_BYTES, detectContentType } from './file-sniff.js'

// The private bucket for identity documents and inspection files (Cloudflare R2, which speaks the S3
// protocol). Files go straight from the browser to the bucket on short-lived signed links; the API never
// handles the file itself. In local development the same code talks to Supabase Storage.
export const LINK_SECONDS = 600

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

let client
function s3() {
  client ??= new S3Client({
    region: process.env.R2_REGION ?? 'auto',
    endpoint:
      process.env.R2_ENDPOINT ?? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: Boolean(process.env.R2_ENDPOINT),
    // R2 and the local store do not take the extra checksum headers newer SDK versions add.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
  return client
}

// Blog images and profile pictures are public (search engines, share previews, and every page that shows a face must
// fetch them), so everything under these folders lives in the public bucket. Every other file is private. The key
// alone says which, so no caller can choose wrongly.
const PUBLIC_PREFIXES = ['blog/', 'avatars/']
const isPublicKey = (key) => PUBLIC_PREFIXES.some((prefix) => key.startsWith(prefix))
const bucket = (key) => (isPublicKey(key) ? process.env.R2_PUBLIC_BUCKET : process.env.R2_BUCKET)

export const documentKey = (ownerId, documentId, contentType) =>
  `documents/${ownerId}/${documentId}.${EXTENSIONS[contentType]}`

export const blogImageKey = (postId, imageId, contentType) =>
  `blog/${postId}/${imageId}.${EXTENSIONS[contentType]}`

export const avatarKey = (userId, fileId, contentType) =>
  `avatars/${userId}/${fileId}.${EXTENSIONS[contentType]}`

export const inspectionKey = (bookingId, fileId, contentType) =>
  `inspections/${bookingId}/${fileId}.${EXTENSIONS[contentType]}`

/**
 * A link the browser can PUT the file to. The type and exact size are part of the signature, so a
 * different file is refused by the bucket.
 */
export async function createUploadUrl({ key, contentType, sizeBytes }) {
  const command = new PutObjectCommand({
    Bucket: bucket(key),
    Key: key,
    ContentType: contentType,
    ContentLength: sizeBytes,
  })
  const url = await getSignedUrl(s3(), command, {
    expiresIn: LINK_SECONDS,
    signableHeaders: new Set(['content-type', 'content-length']),
  })
  return {
    upload_url: url,
    required_headers: { 'Content-Type': contentType, 'Content-Length': String(sizeBytes) },
    expires_in: LINK_SECONDS,
  }
}

/**
 * A link that shows the file for ten minutes. The type is forced to the one we verified, so the browser
 * never guesses, and the link says the response is private and must not be kept.
 */
export async function createDownloadUrl(key, contentType) {
  const command = new GetObjectCommand({
    Bucket: bucket(key),
    Key: key,
    ResponseContentType: contentType,
    ResponseContentDisposition: 'inline',
    ResponseCacheControl: 'private, no-store',
  })
  const url = await getSignedUrl(s3(), command, { expiresIn: LINK_SECONDS })
  return { url, expires_in: LINK_SECONDS }
}

/** The stored file's size, type, and version tag, or null when nothing has been uploaded under that key. */
async function describeObject(key) {
  try {
    const head = await s3().send(new HeadObjectCommand({ Bucket: bucket(key), Key: key }))
    return { size: head.ContentLength, contentType: head.ContentType, etag: head.ETag }
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404) return null
    throw error
  }
}

async function readStart(key) {
  const response = await s3().send(
    new GetObjectCommand({ Bucket: bucket(key), Key: key, Range: `bytes=0-${SNIFF_BYTES - 1}` }),
  )
  return Buffer.from(await response.Body.transformToByteArray())
}

/** A file that failed a check is removed, so it can never be served. */
const discard = (key) => s3().send(new DeleteObjectCommand({ Bucket: bucket(key), Key: key }))

const refuse = (message) => new AppError('VALIDATION_FAILED', { message })

/**
 * Check the file really arrived, is the size and type that was declared, is allowed for its purpose, and
 * starts with the bytes of that type. A file that is not what it claims is deleted. Returns the version
 * tag, so a later swap of the stored file can be told apart from the one that was checked.
 */
export async function assertUploaded(key, { sizeBytes, contentType, purpose }) {
  const stored = await describeObject(key)
  if (!stored || stored.size !== sizeBytes || stored.contentType !== contentType) {
    throw refuse('The file has not been uploaded yet, or it does not match what was declared.')
  }
  if (
    !allowsContentType(purpose, contentType) ||
    detectContentType(await readStart(key)) !== contentType
  ) {
    await discard(key)
    throw refuse('That file is not the kind of file it was declared to be, so it was not accepted.')
  }
  return stored.etag
}

/** The stored file is still the one that was checked. A signed upload link must not swap it afterwards. */
export async function assertUnchanged(key, etag) {
  const stored = await describeObject(key)
  if (!stored || stored.etag !== etag) {
    throw new AppError('NOT_FOUND', { message: 'That file is not available.' })
  }
}

/** Store a file the API made itself (the signed agreement), under a key it chose. Returns its version tag. */
export async function putObject(key, bytes, contentType) {
  const stored = await s3().send(
    new PutObjectCommand({
      Bucket: bucket(key),
      Key: key,
      Body: bytes,
      ContentType: contentType,
      ContentLength: bytes.length,
    }),
  )
  return stored.ETag
}

/** Remove files from the public bucket in one request. A key that is not there is not an error. */
export async function deletePublicObjects(keys) {
  if (keys.length === 0) return
  if (!keys.every(isPublicKey)) {
    throw new Error('deletePublicObjects was given a key outside the public folder.')
  }
  await s3().send(
    new DeleteObjectsCommand({
      Bucket: bucket(keys[0]),
      Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    }),
  )
}

/** Removes public files that nothing refers to any more. A failure is logged, not raised: the record is already gone. */
export async function removeStoredFiles(keys) {
  try {
    await deletePublicObjects(keys)
  } catch (error) {
    logger.error('public_files_not_removed', { count: keys.length, message: error.message })
  }
}
