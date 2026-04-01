import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateCustomerPortalUseCase } from '../../../use-cases/factories/make-create-customer-portal-use-case'
import { ResourceNotFoundError } from '../../../use-cases/errors/resource-not-found-error'

export const portalBodySchema = z.object({
  returnUrl: z.string().url(),
})

export async function portal(request: FastifyRequest, reply: FastifyReply) {
  const { returnUrl } = portalBodySchema.parse(request.body || {})

  try {
    const createCustomerPortal = makeCreateCustomerPortalUseCase()

    const { portalUrl } = await createCustomerPortal.execute({
      userId: request.user.sub, // requires auth middleware
      returnUrl,
    })

    return reply.status(200).send({ portalUrl })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof Error && err.message === 'User does not have a Stripe Customer ID') {
      return reply.status(400).send({ message: err.message })
    }

    throw err
  }
}
