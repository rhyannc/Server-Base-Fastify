import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makePaymentReceivedUseCase } from '@/use-cases/factories/webhooks/make-payment-received-use-case'

export const paymentReceivedBodySchema = z.object({
  userId: z.string().uuid(),
})

export const paymentReceivedBodyResponse = {
  200: z
    .object({
      message: z.string(),
      activatedCompanies: z.number(),
    })
    .describe('Pagamento processado com sucesso!'),
  404: z.object({ message: z.string() }).describe('Assinatura não encontrada'),
}

export async function paymentReceived(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = paymentReceivedBodySchema.parse(request.body)

  try {
    const paymentReceivedUseCase = makePaymentReceivedUseCase()

    const { activatedCompanyIds } = await paymentReceivedUseCase.execute({
      userId,
    })

    return reply.status(200).send({
      message: 'Pagamento confirmado. Assinatura e empresas ativadas.',
      activatedCompanies: activatedCompanyIds.length,
    })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
