import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makePaymentFailedUseCase } from '@/use-cases/factories/webhooks/make-payment-failed-use-case'

export const paymentFailedBodySchema = z.object({
  userId: z.string().uuid(),
})

export const paymentFailedBodyResponse = {
  200: z
    .object({
      message: z.string(),
      frozenCompanies: z.number(),
    })
    .describe('Falha de pagamento processada. Empresas e colaboradores congelados.'),
  404: z.object({ message: z.string() }).describe('Assinatura não encontrada'),
}

export async function paymentFailed(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = paymentFailedBodySchema.parse(request.body)

  try {
    const paymentFailedUseCase = makePaymentFailedUseCase()

    const { frozenCompanyIds } = await paymentFailedUseCase.execute({
      userId,
    })

    return reply.status(200).send({
      message: 'Falha de pagamento processada. Assinatura expirada e empresas congeladas.',
      frozenCompanies: frozenCompanyIds.length,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
