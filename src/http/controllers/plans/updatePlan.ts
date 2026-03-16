import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeUpdatePlansUseCase } from '@/use-cases/factories/make-update-plans'

export const updatePlanBodySchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  price: z.number(),
  maxCollaborators: z.string().regex(/^\d+$/, 'Deve conter apenas números'),
  maxCompanies: z.string().regex(/^\d+$/, 'Deve conter apenas números'),
  maxInvoices: z.string().regex(/^\d+$/, 'Deve conter apenas números'),
})

export const updatePlanBodyResponse = {
  201: z
    .object({ planId: z.number() })
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

  return reply.status(201).send({ planId: plan.id }) //  retorna o ID
}
