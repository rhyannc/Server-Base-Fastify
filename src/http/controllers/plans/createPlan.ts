import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { PlanAlreadyExistsError } from '@/use-cases/errors/plan-already-exists-error'
import { makeCreatePlanUseCase } from '@/use-cases/factories/make-create-plan-use-case'

export const createPlanBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  price: z.number(),
  maxCollaborators: z.number().optional(),
  maxCompanies: z.number().optional(),
  maxInvoices: z.number().optional(),
})

export const createPlanBodyResponse = {
  201: z
    .object({ planId: z.string() })
    .describe('Plano registrado com sucesso!'),
  409: z.object({ message: z.string() }).describe('Plano já existente'),
}

// Função assíncrona que lida com a requisição de registro de uma novo Plano
export async function createPlan(request: FastifyRequest, reply: FastifyReply) {
  const {
    name,
    description,
    isActive,
    isPopular,
    price,
    maxCollaborators,
    maxCompanies,
    maxInvoices,
  } = createPlanBodySchema.parse(request.body)

  try {
    // Inversion Dependency Factoreis Pattern
    const createPlanUseCase = makeCreatePlanUseCase()

    const { plan } = await createPlanUseCase.execute({
      name,
      description,
      isActive: isActive ?? true,
      isPopular: isPopular ?? false,
      price,
      maxCollaborators: maxCollaborators ?? null,
      maxCompanies: maxCompanies ?? null,
      maxInvoices: maxInvoices ?? null,
    })

    return reply.status(201).send({ planId: plan.id }) // 👉 retorna o ID
  } catch (error) {
    // Retorna um erro 409 (Conflito) caso o PLANO já existente
    if (error instanceof PlanAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}
