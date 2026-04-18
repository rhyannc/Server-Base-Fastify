import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { SubscriptionNotActiveError } from '@/use-cases/errors/subscription-not-active-error'
import { makeResumeUserSubscriptionUseCase } from '@/use-cases/factories/make-resume-user-subscription-use-case'

export const resumeSubscriptionResponseSchema = {
  200: z
    .object({
      message: z.string(),
      userSubscription: z.any(),
    })
    .describe('Assinatura reativada com sucesso.'),
}

export async function resumeSubscription(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub

  try {
    const resumeUserSubscriptionUseCase = makeResumeUserSubscriptionUseCase()

    const { userSubscription } = await resumeUserSubscriptionUseCase.execute({
      userId,
    })

    return reply.status(200).send({
      message: 'Assinatura reativada com sucesso.',
      userSubscription,
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
