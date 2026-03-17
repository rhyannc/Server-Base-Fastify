import { Role } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { CollaboratorAlreadyExistsError } from '@/use-cases/errors/collaborator-already-exists-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeCreateCollaboratorUseCase } from '@/use-cases/factories/make-create-collaborator-use-case'

export const createCollaboratorBodySchema = z.object({
  companyId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(['ADMIN', 'MEMBER']).optional().default('MEMBER'),
  active: z.boolean().optional().default(true),
  status: z.enum(['ACTIVE', 'FROZEN', 'ARCHIVED']).optional().default('ACTIVE'),
})

export const createCollaboratorBodyResponse = {
  201: z
    .object({ collaboratorId: z.string().uuid() })
    .describe('Colaborador adicionado com sucesso!'),
  409: z
    .object({ message: z.string() })
    .describe('Usuário já é colaborador desta empresa'),
  404: z.object({ message: z.string() }).describe('Usuário ou Empresa não encontrados'),
}

export async function createCollaborator(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { companyId, userId, role, active, status } =
    createCollaboratorBodySchema.parse(request.body)

  try {
    const createCollaboratorUseCase = makeCreateCollaboratorUseCase()

    const { collaborator } = await createCollaboratorUseCase.execute({
      companyId,
      userId,
      authorId: request.user.sub,
      authorRole: request.user.role as Role,
      role,
      active,
      status,
    })

    return reply.status(201).send({ collaboratorId: collaborator.id })
  } catch (err) {
    if (err instanceof CollaboratorAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
