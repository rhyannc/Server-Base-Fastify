import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'

import {
  subscribe,
  subscribeBodySchema,
  subscribeResponseSchema,
} from './subscribe'
import {
  updateSubscription,
  updateSubscriptionBodySchema,
  updateSubscriptionResponseSchema,
} from './update-subscription'
import {
  getMeSubscription,
} from './getMeSubscription'
import { verifyActiveUser } from '@/http/middlewares/verify-active-user'

export async function userSubscriptionsRoutes(app: FastifyInstance) {
  /** Authenticated */
  app.addHook('onRequest', verifyJWT) // vai obrigar que todas as rotas abaixo tenha Token JWT Valido
  app.addHook('onRequest', verifyActiveUser) // Valida se o usuario esta ativo, se false bloqueia todas as rotas

  app.post(
    '/',
    {
      schema: {
        tags: ['User Subscription'],
        summary: 'Assina um plano para o usuário autenticado',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        body: subscribeBodySchema,
        response: subscribeResponseSchema,
      },
    },
    subscribe,
  )

  app.patch(
    '/',
    {
      schema: {
        tags: ['User Subscription'],
        summary: 'Atualiza o plano ou status da assinatura do usuário logado',
        security: [{ bearerAuth: [] }],
        body: updateSubscriptionBodySchema,
        response: updateSubscriptionResponseSchema,
      },
    },
    updateSubscription,
  )

  app.get(
    '/me',
    {
      schema: {
        tags: ['User Subscription'],
        summary: 'Obtém detalhes da assinatura do usuário logado',
        security: [{ bearerAuth: [] }],
      },
    },
    getMeSubscription,
  )
}
