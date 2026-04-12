import { Role } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { CompanyNoExistError } from '@/use-cases/errors/company-no-exist-error'
import { GenericUnauthorizedError } from '@/use-cases/errors/generic-unauthorized-error'
import { makeToggleCompanyStatusUseCase } from '@/use-cases/factories/make-toggle-company-status'

export const toggleCompanyStatusParamsSchema = z.object({
  companyId: z.string().uuid(),
})

export const toggleCompanyStatusResponseSchema = {
  200: z
    .object({ companyId: z.string(), status: z.string() })
    .describe('Status da empresa alterado com sucesso.'),
  400: z.object({ message: z.string() }).describe('Erro de validação.'),
  401: z.object({ message: z.string() }).describe('Não autorizado.'),
  404: z.object({ message: z.string() }).describe('Empresa não encontrada.'),
}

export async function toggleCompanyStatus(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { companyId } = toggleCompanyStatusParamsSchema.parse(request.params)

  const toggleCompanyStatusUseCase = makeToggleCompanyStatusUseCase()

  try {
    const { company } = await toggleCompanyStatusUseCase.execute({
      id: companyId,
      meId: request.user.sub,
      meSysRole: request.user.role as Role,
    })

    return reply.status(200).send({
      companyId: company.id,
      status: company.status,
    })
  } catch (error) {
    if (error instanceof CompanyNoExistError) {
      return reply.status(404).send({ message: error.message })
    }
    if (error instanceof GenericUnauthorizedError) {
      return reply.status(401).send({ message: error.message })
    }
    if (error instanceof Error && error.message.includes('arquivadas')) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
