import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFindPlansUseCase } from '@/use-cases/factories/make-find-plans'

export const findPlansQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function findPlans(request: FastifyRequest, reply: FastifyReply) {
  const { page } = findPlansQuerySchema.parse(request.query)

  // Inversion Dependency Factoreis Pattern
  const findPlansUseCase = makeFindPlansUseCase()

  const { plans } = await findPlansUseCase.execute({
    page,
  })

  if (!plans || plans.length === 0) {
    return reply.status(404).send({
      message: 'Nenhum plano encontrado.',
      plans: [],
    })
  }

  return reply.status(200).send({ plans: {...plans, createdAt: undefined } })

}
