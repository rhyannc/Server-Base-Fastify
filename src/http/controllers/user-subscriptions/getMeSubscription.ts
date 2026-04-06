import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetMeSubscriptionUseCase } from '@/use-cases/factories/make-get-me-subscription-use-case'
import { z } from 'zod'

export const getMeSubscriptionResponseSchema = {
  200: z.object({
    subscription: z.object({
      id: z.string(),
      userId: z.string(),
      planId: z.string(),
      status: z.string(),
      cardLast4: z.string().nullable(),
      cardBrand: z.string().nullable(),
      startedAt: z.date(),
      expiresAt: z.date().nullable(),
      plan: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        price: z.any(), // Decimal
        maxCompanies: z.number().nullable(),
        maxCollaborators: z.number().nullable(),
        maxInvoices: z.number().nullable(),
      }),
    }),
  }),
}

export async function getMeSubscription(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  const getMeSubscriptionUseCase = makeGetMeSubscriptionUseCase()

  //Busca a assinatura do usuário
  const { subscription } = await getMeSubscriptionUseCase.execute({
    userId,
  })

  return reply.status(200).send({ subscription })
}
