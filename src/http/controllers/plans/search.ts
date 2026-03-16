import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchPlansUseCase } from '@/use-cases/factories/make-search-plans'

export const searchPlansQuerySchema = z.object({
  q: z.string().min(1, 'q não pode ser vazio').describe('Pequisa por Nome'),
  page: z.coerce.number().min(1).default(1),
})

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const { q, page } = searchPlansQuerySchema.parse(request.query)

  const searchPlansUseCase = makeSearchPlansUseCase()

  const { plans } = await searchPlansUseCase.execute({
    query: q,
    page,
  })

  if (!plans || plans.length === 0) {
    return reply.status(404).send({
      message: 'Nenhum plano.',
      plans: [],
    })
  }

  return reply.status(200).send({
    plans,
  })
}
