import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSelectCompanyUseCase } from '@/use-cases/factories/make-select-company-use-case'

export const selectCompanyParamsSchema = z.object({
  companyId: z.string().uuid(),
})

export const selectCompanyBodyResponse = {
  200: z
    .object({
      company: z.object({
        id: z.string().uuid(),
        name: z.string(),
        status: z.string(),
        lastAccess: z.date().nullable(),
      }),
    })
    .describe('Empresa selecionada com sucesso e acesso registrado.'),
  501: z.object({ message: z.string() }).describe('Empresa não encontrada.'),
  500: z.object({ message: z.string() }).describe('Empresa não está ativa.'),
}

export async function selectCompany(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = selectCompanyParamsSchema.parse(request.params)

  const selectCompanyUseCase = makeSelectCompanyUseCase()

  const { company } = await selectCompanyUseCase.execute({
    companyId,
  })

  return reply.status(200).send({
    company,
  })
}
