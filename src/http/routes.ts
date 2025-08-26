import { FastifyInstance } from 'fastify'

import { register } from './controllers/register'

export async function appRoutes(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Register'],
        summary: 'Cria um novo usuário',
        description: 'Endpoint para registrar um novo usuário',
      },
    },
    register,
  )
}
