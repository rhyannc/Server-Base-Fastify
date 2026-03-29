import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeUpdatePlansUseCase } from '@/use-cases/factories/make-update-plans'

export const updatePlanBodySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  price: z.number().optional(),
  maxCollaborators: z.number().optional(),
  maxCompanies: z.number().optional(),
  maxInvoices: z.number().optional(),
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
  })

  return reply.status(200).send({ planId: plan.id }) //  retorna o ID
}
