import { FastifyInstance } from 'fastify'

import {
  paymentFailed,
  paymentFailedBodyResponse,
  paymentFailedBodySchema,
} from './payment-failed'
import {
  paymentReceived,
  paymentReceivedBodyResponse,
  paymentReceivedBodySchema,
} from './payment-received'
import {
  subscriptionCanceled,
  subscriptionCanceledBodyResponse,
  subscriptionCanceledBodySchema,
} from './subscription-canceled'

export async function webhooksRoutes(app: FastifyInstance) {
  // Webhooks NÃO usam verifyJWT — são chamados por serviços externos (gateway de pagamento)

  app.post(
    '/payment-received',
    {
      schema: {
        tags: ['Webhooks'],
        summary:
          'Webhook chamado pelo gateway quando um pagamento é confirmado',
        body: paymentReceivedBodySchema,
        response: paymentReceivedBodyResponse,
      },
    },
    paymentReceived,
  )

  app.post(
    '/payment-failed',
    {
      schema: {
        tags: ['Webhooks'],
        summary:
          'Webhook chamado pelo gateway quando um pagamento falha ou expira',
        body: paymentFailedBodySchema,
        response: paymentFailedBodyResponse,
      },
    },
    paymentFailed,
  )

  app.post(
    '/subscription-canceled',
    {
      schema: {
        tags: ['Webhooks'],
        summary:
          'Webhook chamado pelo gateway quando o usuário cancela a assinatura',
        body: subscriptionCanceledBodySchema,
        response: subscriptionCanceledBodyResponse,
      },
    },
    subscriptionCanceled,
  )
}

