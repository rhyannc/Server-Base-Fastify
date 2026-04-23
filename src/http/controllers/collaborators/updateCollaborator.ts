import { Role } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { GenericUnauthorizedError } from '@/use-cases/errors/generic-unauthorized-error'
import { PlanLimitReachedError } from '@/use-cases/errors/plan-limit-reached-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeUpdateCollaboratorUseCase } from '@/use-cases/factories/make-update-collaborator-use-case'

// garantindo que o collaboratorId seja um UUID válido.
export const updateCollaboratorParamsSchema = z.object({
  collaboratorId: z.string().uuid(),
})

export const updateCollaboratorBodySchema = z.object({
  role: z.enum(['LEAD', 'COLLABORATOR']).optional(),
  status: z.enum(['ACTIVE', 'FROZEN', 'ARCHIVED']).optional(),
})

export async function updateCollaborator(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai e valida o id do colaborador vindo da URL (ex: /collaborator/{collab_id})
  const { collaboratorId } = updateCollaboratorParamsSchema.parse(
    request.params,
  )

  // Extrai e valida os campos opcionais enviados no corpo da requisição
  const { role, status } = updateCollaboratorBodySchema.parse(
    request.body,
  )

  try {
    // Instancia o caso de uso encarregado de injetar os repositórios reais (Prisma)
    const updateCollaboratorUseCase = makeUpdateCollaboratorUseCase()

    const { collaborator } = await updateCollaboratorUseCase.execute({
      collaboratorId,
      meId: request.user.sub,
      meSysRole: request.user.role as Role,
      role,
      status,
      ip: request.ip,
      userAgent: request.headers['user-agent'] as string,
    })

    return reply.status(200).send({ collaborator })
  } catch (err) {
    // 403 Forbidden se o usuário não for ADMIN nem Manager da empresa
    if (err instanceof GenericUnauthorizedError) {
      return reply.status(403).send({ message: err.message })
    }

    // Retorna 404 Not Found se o colaborador ou a empresa a qual ele pertence não for encontrado
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof PlanLimitReachedError) {
      return reply.status(409).send({ message: err.message })
    }

    // Lança qualquer erro inesperado para ser tratado pelo handler global do Fastify
    throw err
  }
}
