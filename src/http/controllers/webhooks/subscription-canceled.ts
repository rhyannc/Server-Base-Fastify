import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeSubscriptionCanceledUseCase } from '@/use-cases/factories/webhooks/make-subscription-canceled-use-case'

export const subscriptionCanceledBodySchema = z.object({
  userId: z.string().uuid(),
})

export const subscriptionCanceledBodyResponse = {
  200: z
    .object({
      message: z.string(),
      archivedCompanies: z.number(),
    })
    .describe('Cancelamento processado com sucesso.'),
  404: z.object({ message: z.string() }).describe('Assinatura não encontrada'),
}

export async function subscriptionCanceled(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = subscriptionCanceledBodySchema.parse(request.body)

  try {
    const subscriptionCanceledUseCase = makeSubscriptionCanceledUseCase()

    const { archivedCompanyIds } = await subscriptionCanceledUseCase.execute({
      userId,
    })

    return reply.status(200).send({
      message: 'Cancelamento processado. Assinatura cancelada e empresas arquivadas.',
      archivedCompanies: archivedCompanyIds.length,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
