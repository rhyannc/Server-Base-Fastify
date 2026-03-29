import { FastifyInstance } from 'fastify'

import {
  autenticateBodyResponse,
  autenticateBodySchema,
  authenticate,
} from './controllers/autenticate'
import { refresh } from './controllers/refresh'
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

  app.post(
    '/session',
    {
      config: {
        rateLimit: {
          max: 5, // máximo de 5 tentativas
          timeWindow: '5 minutes', // por IP, a cada 5 minutos
          errorResponseBuilder: () => ({
            statusCode: 429,
            message:
              'Você exedeu o limite de requisições para essa ação, Aguarde 5 minutos para tentar novamente.',
          }),
        },
      },
      schema: {
        tags: ['Register'],
        summary: 'Authentica um usuário',
        body: autenticateBodySchema,
        response: autenticateBodyResponse,
      },
    },
    authenticate,
  )

  app.patch(
    '/token/refresh',
    { schema: { tags: ['Register'], summary: 'Rota de recriar um token' } },
    refresh,
  )
}
