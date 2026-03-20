import { SubscriptionStatus } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { PlanNotActiveError } from '@/use-cases/errors/plan-not-active-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UserSubscriptionAlreadyExistsError } from '@/use-cases/errors/user-subscription-already-exists-error'
import { makeCreateUserSubscriptionUseCase } from '@/use-cases/factories/make-create-user-subscription-use-case'

export const subscribeBodySchema = z.object({
  planId: z.string(),
  status: z
    .enum(['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED'])
    .optional()
    .default('ACTIVE'), // Em um ambiente real isso dependeria de callback de pagamento
})

export const subscribeResponseSchema = {
  201: z
    .object({
      userSubscription: z.object({
        id: z.string(),
        userId: z.string(),
        planId: z.string(),
        status: z.string(),
      }),
    })
    .describe('Assinatura criada com sucesso.'),
}

export async function subscribe(request: FastifyRequest, reply: FastifyReply) {
  const { planId, status } = subscribeBodySchema.parse(request.body)

  const userId = request.user.sub

  try {
    const createUserSubscriptionUseCase = makeCreateUserSubscriptionUseCase()

    const { userSubscription } = await createUserSubscriptionUseCase.execute({
      userId,
      planId,
      status: status as SubscriptionStatus,
    })

    return reply.status(201).send({ userSubscription })
  } catch (err) {
    if (err instanceof UserSubscriptionAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    if (err instanceof PlanNotActiveError) {
      return reply.status(400).send({ message: err.message })
    }

    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
