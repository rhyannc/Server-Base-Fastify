import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateCheckoutSessionUseCase } from '../../../use-cases/factories/make-create-checkout-session-use-case'
import { ResourceNotFoundError } from '../../../use-cases/errors/resource-not-found-error'

export const checkoutBodySchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export async function checkout(request: FastifyRequest, reply: FastifyReply) {
  const { priceId, successUrl, cancelUrl } = checkoutBodySchema.parse(
    request.body || {},
  )

  try {
    const createCheckoutSession = makeCreateCheckoutSessionUseCase()

    const { checkoutUrl } = await createCheckoutSession.execute({
      userId: request.user.sub, // requires auth middleware
      priceId,
      successUrl,
      cancelUrl,
    })

    if (!checkoutUrl) {
      return reply.status(400).send({ message: 'Could not create checkout session' })
    }

    return reply.status(200).send({ checkoutUrl })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
