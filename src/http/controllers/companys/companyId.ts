import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetCompanyidUseCase } from '@/use-cases/factories/make-get-company-id-use-case'

export const companyIdBodySchema = z.object({
  companyId: z.string().uuid().describe('ID da company (UUID)'),
})

export const companyIdBodyResponse = {
  200: z
    .object({
      company: z.object({
        id: z.string().uuid(),
        name: z.string(),
        cnpj: z.string().nullable(),
        email: z.string(),
        phone: z.string().nullable(),
        country: z.string(),
        city: z.string().nullable(),
        state: z.string().nullable(),
        address: z.string().nullable(),
        number: z.string().nullable(),
        complement: z.string().nullable(),
        cep: z.string().nullable(),
        active: z.boolean(),
        createdBy: z.string().nullable(),
        createdAt: z.date(),
        updatedBy: z.string().nullable(),
        updatedAt: z.date(),
      }),
    })
    .describe('Dados de empresa retornados com sucesso!'),
  401: z.object({ message: z.string() }).describe('Não Autoziado.'),
}

// Função que retorna com dados de user pelo JWT
export async function companyId(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = companyIdBodySchema.parse(request.params)

  // Inversion Dependency Factoreis Pattern
  const getCompanyId = makeGetCompanyidUseCase()

  const { company } = await getCompanyId.execute({
    companyId,
  })

  if (!company) {
    return reply.status(404).send({ message: 'Company não encontrada' })
  }

  return reply.status(200).send({ company: { ...company } })
}
