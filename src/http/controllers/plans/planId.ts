import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetPlanIdUseCase } from '@/use-cases/factories/make-get-plan-id-use-case'

export const planIdBodySchema = z.object({
  planId: z.coerce.number(),
})

export const planIdBodyResponse = {
  200: z
    .object({
      plan: z.object({
        id: z.coerce.number(),
        name: z.string(),
        description: z.string(),
        isActive: z.boolean(),
        isPopular: z.boolean(),
        price: z.coerce.number(),
        maxCompanies: z.coerce.number(),
        maxCollaborators: z.coerce.number(),
        maxInvoices: z.coerce.number(),
        createdAt: z.date(),
      }),
    })
    .describe('Dados do Plano retornados com sucesso!'),
  401: z.object({ message: z.string() }).describe('Não Autoziado.'),
}

// Função que retorna com dados de user pelo JWT
export async function planId(request: FastifyRequest, reply: FastifyReply) {
  const { planId } = planIdBodySchema.parse(request.params)

  // Inversion Dependency Factoreis Pattern
  const getUserProfile = makeGetPlanIdUseCase()

  const { plan } = await getUserProfile.execute({
    planId,
  })

  if (!plan) {
    return reply.status(404).send({ message: 'Plano não encontrado' })
  }

  return reply.status(200).send({ plan: { ...plan } })
}
