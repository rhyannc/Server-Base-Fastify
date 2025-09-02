import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'

import { meBodyResponse, profile } from './profile'
import { userId, userIdBodyResponse, userIdBodySchema } from './userId'

export async function usersRoutes(app: FastifyInstance) {
  /** Authenticated */
  app.addHook('onRequest', verifyJWT) // vai obrigar que todas as rotas abaixo tenha Token JWT Valido

  app.get(
    '/me',
    {
      schema: {
        tags: ['User'],
        summary: 'Retorna dados do usuario logado, usando o id no bearer token',
        security: [{ bearerAuth: [] }],
        response: meBodyResponse,
      },
    },
    profile,
  )

  app.get(
    '/user/:userId',
    {
      schema: {
        tags: ['User'],
        summary: 'Retorna dados do usuario passando o id',
        security: [{ bearerAuth: [] }],
        params: userIdBodySchema,
        response: userIdBodyResponse,
      },
    },
    userId,
  )
}
