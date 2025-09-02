import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetUserIdUseCase } from '@/use-cases/factories/make-get-user-id-use-case'

export const userIdBodySchema = z.object({
  userId: z.string().uuid().describe('ID do usuario (UUID)'),
})

export const userIdBodyResponse = {
  200: z
    .object({
      user: z
        .object({
          id: z.string().uuid(),
          name: z.string(),
          email: z.string(),
          phone: z.string().nullable(),
          password_hash: z.string(),
          plan: z.string(),
          active: z.boolean(),
          role: z.string(),
          createdBy: z.string().nullable(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
        .omit({ password_hash: true }), // Remove password_hash da resposta
    })
    .describe('Dados do usuário retornados com sucesso!'),
  401: z.object({ message: z.string() }).describe('Não Autoziado.'),
}

// Função que retorna com dados de user pelo JWT
export async function userId(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = userIdBodySchema.parse(request.params)

  // Inversion Dependency Factoreis Pattern
  const getUserProfile = makeGetUserIdUseCase()

  const { user } = await getUserProfile.execute({
    userId,
  })

  if (!user) {
    return reply.status(404).send({ message: 'Usuario não encontrado' })
  }

  return reply.status(200).send({ user: { ...user, password_hash: undefined } })
}
