import { Role } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchCollaboratorsByCompanyUseCase } from '@/use-cases/factories/make-search-collaborators-by-company-use-case'

export const searchCollaboratorsByCompanyParamsSchema = z.object({
  companyId: z.string().uuid(),
  query: z.string(),
})

export const searchCollaboratorsByCompanyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function searchCollaboratorsByCompany(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { companyId, query } = searchCollaboratorsByCompanyParamsSchema.parse(
    request.params,
  )
  const { page } = searchCollaboratorsByCompanyQuerySchema.parse(request.query)

  // Descodificar a query caso venha com caracteres especiais (ex: espaços codificados)
  const decodedQuery = decodeURIComponent(query)

  const searchCollaboratorsByCompanyUseCase =
    makeSearchCollaboratorsByCompanyUseCase()

  const { collaborators, meta } =
    await searchCollaboratorsByCompanyUseCase.execute({
      companyId,
      query: decodedQuery,
      page,
      meId: request.user.sub,
      meSysRole: request.user.role as Role,
    })

  return reply.status(200).send({ meta, collaborators })
}
