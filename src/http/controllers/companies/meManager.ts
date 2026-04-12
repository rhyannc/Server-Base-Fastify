import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFindUserIdCompaniesUseCase } from '@/use-cases/factories/make-find-companies-userId'

export const meQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function meManager(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { page } = meQuerySchema.parse(request.query)
  const userId = request.user.sub

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
