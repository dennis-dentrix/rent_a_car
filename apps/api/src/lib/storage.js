import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { AppError } from './errors.js'

// The private bucket for identity documents and inspection files (Cloudflare R2, which speaks the S3
// protocol). Files go straight from the browser to the bucket on short-lived signed links; the API never
// handles the file itself. In local development the same code talks to Supabase Storage.
export const LINK_SECONDS = 600

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'application/pdf': 'pdf' }

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

const bucket = () => process.env.R2_BUCKET

export const documentKey = (ownerId, documentId, contentType) =>
  `documents/${ownerId}/${documentId}.${EXTENSIONS[contentType]}`

export const inspectionKey = (bookingId, fileId, contentType) =>
  `inspections/${bookingId}/${fileId}.${EXTENSIONS[contentType]}`

/**
 * A link the browser can PUT the file to. The type and exact size are part of the signature, so a
 * different file is refused by the bucket.
 */
export async function createUploadUrl({ key, contentType, sizeBytes }) {
  const command = new PutObjectCommand({
    Bucket: bucket(),
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

/** A link that shows the file for ten minutes. */
export async function createDownloadUrl(key) {
  const url = await getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket(), Key: key }), {
    expiresIn: LINK_SECONDS,
  })
  return { url, expires_in: LINK_SECONDS }
}

/** The stored file's size and type, or null when nothing has been uploaded under that key. */
async function describeObject(key) {
  try {
    const head = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }))
    return { size: head.ContentLength, contentType: head.ContentType }
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404) return null
    throw error
  }
}

/** Check the file really arrived and is the size and type that was declared. */
export async function assertUploaded(key, { sizeBytes, contentType }) {
  const stored = await describeObject(key)
  if (!stored || stored.size !== sizeBytes || stored.contentType !== contentType) {
    throw new AppError('VALIDATION_FAILED', {
      message: 'The file has not been uploaded yet, or it does not match what was declared.',
    })
  }
}

/** Store a file the API made itself (the signed agreement), under a key it chose. */
export async function putObject(key, bytes, contentType) {
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: bytes,
      ContentType: contentType,
      ContentLength: bytes.length,
    }),
  )
}
