import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchCompaniesUseCase } from '@/use-cases/factories/make-search-companies'

export const searchCompaniesQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'q não pode ser vazio')
    .describe('Pequisa por Nome ou Cnpj'),
  page: z.coerce.number().min(1).default(1),
})

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const { q, page } = searchCompaniesQuerySchema.parse(request.query)

  const searchCompaniesUseCase = makeSearchCompaniesUseCase()

  const { company } = await searchCompaniesUseCase.execute({
    query: q,
    page,
  })

  if (!company || company.length === 0) {
    return reply.status(404).send({
      message: 'Nenhuma empresa.',
      company: [],
    })
  }

  return reply.status(200).send({
    company,
  })
}
