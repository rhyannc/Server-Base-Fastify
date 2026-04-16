import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { SubscriptionNotActiveError } from '@/use-cases/errors/subscription-not-active-error'
import { makeCancelUserSubscriptionUseCase } from '@/use-cases/factories/make-cancel-user-subscription-use-case'

export const cancelSubscriptionResponseSchema = {
  200: z
    .object({
      message: z.string(),
      archivedCompanyIds: z.array(z.string()),
    })
    .describe('Assinatura cancelada com sucesso.'),
}

export async function cancelSubscription(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub

  try {
    const cancelUserSubscriptionUseCase = makeCancelUserSubscriptionUseCase()

    const { archivedCompanyIds } = await cancelUserSubscriptionUseCase.execute({
      userId,
    })

    return reply.status(200).send({
      message: 'Assinatura cancelada com sucesso.',
      archivedCompanyIds,
    })
  } catch (err) {
    if (err instanceof SubscriptionNotActiveError) {
      return reply.status(400).send({ message: err.message })
    }

    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
