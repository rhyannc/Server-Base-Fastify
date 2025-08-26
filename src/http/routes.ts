import { FastifyInstance } from 'fastify'

import {
  register,
  registerBodyResponse,
  registerBodySchema,
} from './controllers/register'

export async function appRoutes(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Register'],
        summary: 'Cria um novo usuário',
        body: registerBodySchema,
        response: registerBodyResponse,
      },
    },
    register,
  )
}
