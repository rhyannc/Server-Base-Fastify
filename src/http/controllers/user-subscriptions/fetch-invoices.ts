import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchUserInvoicesUseCase } from '@/use-cases/factories/make-fetch-user-invoices-use-case'

export const fetchInvoicesQuerySchema = z.object({
  limit: z.coerce.number().default(12),
})

export const fetchInvoicesResponseSchema = {
  200: z.object({
    invoices: z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        planId: z.string(),
        status: z.string(),
        price: z.any(), // Decimal
        currency: z.string(),
        cardLast4: z.string().nullable(),
        cardBrand: z.string().nullable(),
        startedAt: z.date(),
        createdAt: z.date(),
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
    ),
  }),
}

export async function fetchInvoices(request: FastifyRequest, reply: FastifyReply) {
  const { limit } = fetchInvoicesQuerySchema.parse(request.query)

  const fetchUserInvoicesUseCase = makeFetchUserInvoicesUseCase()

  const { invoices } = await fetchUserInvoicesUseCase.execute({
    userId: request.user.sub,
    limit,
  })

  return reply.status(200).send({ invoices })
}
