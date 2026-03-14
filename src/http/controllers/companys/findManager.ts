import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFindUserIdCompanysUseCase } from '@/use-cases/factories/make-find-companys-userId'

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
  const FetchCompanysUserId = makeFindUserIdCompanysUseCase()

  const { company } = await FetchCompanysUserId.execute({
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
