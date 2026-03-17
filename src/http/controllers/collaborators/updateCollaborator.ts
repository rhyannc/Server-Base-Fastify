import { Role } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { GenericUnauthorizedError } from '@/use-cases/errors/generic-unauthorized-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeUpdateCollaboratorUseCase } from '@/use-cases/factories/make-update-collaborator-use-case'

export const updateCollaboratorParamsSchema = z.object({
  collaboratorId: z.string().uuid(),
})

export const updateCollaboratorBodySchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  active: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'FROZEN', 'ARCHIVED']).optional(),
})

export async function updateCollaborator(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { collaboratorId } = updateCollaboratorParamsSchema.parse(
    request.params,
  )
  const { role, active, status } = updateCollaboratorBodySchema.parse(
    request.body,
  )

  try {
    const updateCollaboratorUseCase = makeUpdateCollaboratorUseCase()

    const { collaborator } = await updateCollaboratorUseCase.execute({
      collaboratorId,
      authorId: request.user.sub,
      authorRole: request.user.role as Role,
      role,
      active,
      status,
    })

    return reply.status(200).send({ collaborator })
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
