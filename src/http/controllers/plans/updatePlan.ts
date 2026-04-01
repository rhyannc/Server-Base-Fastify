import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeUpdatePlansUseCase } from '@/use-cases/factories/make-update-plans'

export const updatePlanBodySchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  price: z.number().optional(),
  maxCollaborators: z.number().optional(),
  maxCompanies: z.number().optional(),
  maxInvoices: z.number().optional(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
})

export const updatePlanBodyResponse = {
  200: z
    .object({ planId: z.string() })
    .describe('Plano atualizado com sucesso!'),
  409: z.object({ message: z.string() }).describe('Plano já existente'),
}

// Função assíncrona que lida com a requisição de atualização de um Plano
export async function updatePlan(request: FastifyRequest, reply: FastifyReply) {
  const {
    id,
    name,
    description,
    isActive,
    isPopular,
    price,
    maxCollaborators,
    maxCompanies,
    maxInvoices,
    stripeProductId,
    stripePriceId,
  } = updatePlanBodySchema.parse(request.body)

  const updatePlanUseCase = makeUpdatePlansUseCase()

  const { plan } = await updatePlanUseCase.execute({
    id,
    name,
    description,
    isActive,
    isPopular,
    price,
    maxCollaborators,
    maxCompanies,
    maxInvoices,
    stripeProductId,
    stripePriceId,
  })

  return reply.status(200).send({ planId: plan.id }) //  retorna o ID
}
