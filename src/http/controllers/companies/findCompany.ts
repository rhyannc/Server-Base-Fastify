import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFindCompaniesUseCase } from '@/use-cases/factories/make-find-companies'

export const findCompaniesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function findCompanies(request: FastifyRequest, reply: FastifyReply) {
  const { page } = findCompaniesQuerySchema.parse(request.query)

  // Inversion Dependency Factoreis Pattern
  const findCompanyUseCase = makeFindCompaniesUseCase()

  const {companies } = await findCompanyUseCase.execute({
    page,
  })

  if (!companies || companies.length === 0) {
    return reply.status(404).send({
      message: 'Nenhuma empresa encontrada.',
      companies: [],
    })
  }

  return reply.status(200).send({ companies })
}
