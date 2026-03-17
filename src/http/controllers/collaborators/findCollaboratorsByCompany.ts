import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFetchCompanyCollaboratorsUseCase } from '@/use-cases/factories/make-fetch-company-collaborators-use-case'

export const findCollaboratorsByCompanyParamsSchema = z.object({
  companyId: z.string().uuid(),
})

export const findCollaboratorsByCompanyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function findCollaboratorsByCompany(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { companyId } = findCollaboratorsByCompanyParamsSchema.parse(
    request.params,
  )
  const { page } = findCollaboratorsByCompanyQuerySchema.parse(request.query)

  const fetchCompanyCollaboratorsUseCase =
    makeFetchCompanyCollaboratorsUseCase()

  const { collaborators } = await fetchCompanyCollaboratorsUseCase.execute({
    companyId,
    page,
  })

  return reply.status(200).send({ collaborators })
}
