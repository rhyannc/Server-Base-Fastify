import { Role } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod' 

import { makeFetchCollaboratorsByCompanyUseCase } from '@/use-cases/factories/make-fetch-collaborators-by-company-use-case'

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

  const fetchCollaboratorsByCompanyUseCase =
    makeFetchCollaboratorsByCompanyUseCase()

  const { collaborators, meta } =
    await fetchCollaboratorsByCompanyUseCase.execute({
      companyId,
      meId: request.user.sub,
      meSysRole: request.user.role as Role,
      page,
    })

  return reply.status(200).send({ meta, collaborators })
}
