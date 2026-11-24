import { listQuerySchema } from '@rent-a-car/shared'
import { idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import { createResource, getResource, listResource, updateResource } from '../services/resources.js'

/**
 * Mounts list, read, create, and change for each kind of record at `/<path>`, on a router whose parent has already
 * checked who is calling. A kind with no `update` has no change route.
 */
export function mountResources(router, resources) {
  router.param('id', idParam)
  Object.entries(resources).forEach(([path, definition]) => {
    const route = `/${path}`
    router.get(
      route,
      handle((req) => listResource(req.auth, definition, listQuerySchema.parse(req.query))),
    )
    router.get(
      `${route}/:id`,
      handle(async (req) => ({ data: await getResource(req.auth, definition, req.params.id) })),
    )
    router.post(
      route,
      handle(async (req) => ({
        data: await createResource(req.auth, definition, definition.create.parse(req.body)),
        status: 201,
      })),
    )
    if (!definition.update) return
    router.patch(
      `${route}/:id`,
      handle(async (req) => ({
        data: await updateResource(
          req.auth,
          definition,
          req.params.id,
          definition.update.parse(req.body),
        ),
      })),
    )
  })
}
