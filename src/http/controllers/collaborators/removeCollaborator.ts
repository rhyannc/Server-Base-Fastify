import { Role } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { GenericUnauthorizedError } from '@/use-cases/errors/generic-unauthorized-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeRemoveCollaboratorUseCase } from '@/use-cases/factories/make-remove-collaborator-use-case'

export const removeCollaboratorParamsSchema = z.object({
  collaboratorId: z.string().uuid(),
})

export async function removeCollaborator(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { collaboratorId } = removeCollaboratorParamsSchema.parse(
    request.params,
  )

  try {
    const removeCollaboratorUseCase = makeRemoveCollaboratorUseCase()

    await removeCollaboratorUseCase.execute({
      collaboratorId,
      authorId: request.user.sub,
      authorRole: request.user.role as Role,
    })

    return reply.status(204).send()
  } catch (err) {
    if (err instanceof GenericUnauthorizedError) {
      return reply.status(403).send({ message: err.message })
    }

    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
