import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFetchUserCompaniesUseCase } from '@/use-cases/factories/make-fetch-user-companies-use-case'

export const findCompaniesByUserQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function findCompaniesByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { page } = findCompaniesByUserQuerySchema.parse(request.query)
  const userId = request.user.sub

  const fetchUserCompaniesUseCase = makeFetchUserCompaniesUseCase()

  const { collaborators } = await fetchUserCompaniesUseCase.execute({
    userId,
    page,
  })

  return reply.status(200).send({ collaborators })
}
