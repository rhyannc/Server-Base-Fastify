import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeTransferManagerCompanyUseCase } from '@/use-cases/factories/make-transfer-manager-company-use-case'

export const transferManagerCompanyParamsSchema = z.object({
  companyId: z.string().uuid(),
})

export const transferManagerCompanyBodySchema = z.object({
  newManagerId: z.string().uuid(),
})

export const transferManagerCompanyBodyResponse = {
  200: z.object({
    company: z.object({
      id: z.string(),
      name: z.string(),
      managerId: z.string(),
      status: z.string(),
    }),
  }).describe('Gerência transferida com sucesso.'),
  404: z.object({ message: z.string() }).describe('Empresa ou Usuário não encontrado.'),
  403: z.object({ message: z.string() }).describe('Novo manager sem plano ativo ou limite excedido.'),
}

export async function transferManagerCompany(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { companyId } = transferManagerCompanyParamsSchema.parse(request.params)
  const { newManagerId } = transferManagerCompanyBodySchema.parse(request.body)

  const transferManagerCompanyUseCase = makeTransferManagerCompanyUseCase()

  const { company } = await transferManagerCompanyUseCase.execute({
    companyId,
    newManagerId,
  })

  return reply.status(200).send({ company })
}
