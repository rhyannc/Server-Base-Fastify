import { SubscriptionStatus } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { PlanNotActiveError } from '@/use-cases/errors/plan-not-active-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeUpdateUserSubscriptionUseCase } from '@/use-cases/factories/make-update-user-subscription-use-case'

export const updateSubscriptionBodySchema = z.object({
  planId: z.string().uuid().optional(),

})

export const updateSubscriptionResponseSchema = {
  200: z
    .object({
      userSubscription: z.object({
        id: z.string(),
        userId: z.string(),
        planId: z.string(),
        status: z.string(),
      }),
    })
    .describe('Assinatura atualizada com sucesso.'),
}

export async function updateSubscription(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { planId } = updateSubscriptionBodySchema.parse(request.body)
  const userId = request.user.sub

  try {
    const updateUserSubscriptionUseCase = makeUpdateUserSubscriptionUseCase()

    const { userSubscription } = await updateUserSubscriptionUseCase.execute({
      userId,
      planId
    })

    return reply.status(200).send({ userSubscription })
  } catch (err) {
    if (err instanceof PlanNotActiveError) {
      return reply.status(400).send({ message: err.message })
    }

    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
