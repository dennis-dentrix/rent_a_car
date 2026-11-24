import { Router } from 'express'
import {
  addImageSchema,
  createImageUploadSchema,
  createPostSchema,
  listQuerySchema,
  updateImageSchema,
  updatePostSchema,
} from '@rent-a-car/shared'
import { idParam } from '../middleware/auth.js'
import { publicCache } from '../middleware/cache.js'
import { handle } from '../middleware/respond.js'
import { createAnonClient } from '../lib/supabase.js'
import {
  addImage,
  createImageUpload,
  createPost,
  deletePost,
  getPost,
  getPublicPost,
  listPosts,
  listPublicPosts,
  removeImage,
  updateImage,
  updatePost,
} from '../services/posts.js'

// Public: published guides. A new one shows within a minute, which is as long as the edge keeps an answer.
export const publicPostsRouter = Router()

publicPostsRouter.get(
  '/posts',
  publicCache(60),
  handle(async () => ({ data: await listPublicPosts(createAnonClient()) })),
)

publicPostsRouter.get(
  '/posts/:slug',
  publicCache(60),
  handle(async (req) => ({ data: await getPublicPost(createAnonClient(), req.params.slug) })),
)

// Admin only (the parent router checks the role and the second factor): write and publish guides.
export const adminPostsRouter = Router()
adminPostsRouter.param('id', idParam)
adminPostsRouter.param('imageId', idParam)

adminPostsRouter.get(
  '/posts',
  handle((req) => listPosts(req.auth.db, listQuerySchema.parse(req.query))),
)

adminPostsRouter.post(
  '/posts',
  handle(async (req) => ({
    data: await createPost(req.auth.db, req.auth.user.id, createPostSchema.parse(req.body)),
    status: 201,
  })),
)

adminPostsRouter.get(
  '/posts/:id',
  handle(async (req) => ({ data: await getPost(req.auth.db, req.params.id) })),
)

adminPostsRouter.patch(
  '/posts/:id',
  handle(async (req) => ({
    data: await updatePost(req.auth.db, req.params.id, updatePostSchema.parse(req.body)),
  })),
)

adminPostsRouter.delete(
  '/posts/:id',
  handle(async (req) => {
    await deletePost(req.auth.db, req.params.id)
    return { data: { id: req.params.id } }
  }),
)

adminPostsRouter.post(
  '/posts/:id/image-uploads',
  handle(async (req) => ({
    data: await createImageUpload(
      req.auth.db,
      req.params.id,
      createImageUploadSchema.parse(req.body),
    ),
    status: 201,
  })),
)

adminPostsRouter.post(
  '/posts/:id/images',
  handle(async (req) => ({
    data: await addImage(req.auth.db, req.params.id, addImageSchema.parse(req.body)),
    status: 201,
  })),
)

adminPostsRouter.patch(
  '/posts/:id/images/:imageId',
  handle(async (req) => ({
    data: await updateImage(
      req.auth.db,
      req.params.id,
      req.params.imageId,
      updateImageSchema.parse(req.body),
    ),
  })),
)

adminPostsRouter.delete(
  '/posts/:id/images/:imageId',
  handle(async (req) => {
    await removeImage(req.auth.db, req.params.id, req.params.imageId)
    return { data: { id: req.params.imageId } }
  }),
)
