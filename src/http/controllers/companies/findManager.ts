import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFindUserIdCompaniesUseCase } from '@/use-cases/factories/make-find-companies-userId'

export const findManagerQuerySchema = z.object({
  userId: z.string().uuid().describe('ID do usuário (UUID)'),
  page: z.coerce.number().min(1).default(1),
})

export async function findManager(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId, page } = findManagerQuerySchema.parse(request.query)

  // Inversion Dependency Factoreis Pattern
  const FetchCompaniesUserId = makeFindUserIdCompaniesUseCase()

  const { company } = await FetchCompaniesUserId.execute({
    userId,
    page,
  })

  if (!company || company.length === 0) {
    return reply.status(404).send({
      message: 'Nenhuma empresa encontrada para este usuário.',
      company: [],
    })
  }

  return reply.status(200).send({
    company,
  })
}
