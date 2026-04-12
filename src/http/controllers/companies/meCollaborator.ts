import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFetchUserCompaniesUseCase } from '@/use-cases/factories/make-fetch-user-companies-use-case'

export const meCollaboratorQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function meCollaborator(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { page } = meCollaboratorQuerySchema.parse(request.query)
  const userId = request.user.sub

  const fetchUserCompaniesUseCase = makeFetchUserCompaniesUseCase()

  const { collaborators } = await fetchUserCompaniesUseCase.execute({
    userId,
    page,
  })

  if (!collaborators || collaborators.length === 0) {
    return reply.status(404).send({
      message: 'Nenhuma empresa encontrada para este usuário.',
      collaborators: [],
    })
  }

  return reply.status(200).send({ collaborators })
}
