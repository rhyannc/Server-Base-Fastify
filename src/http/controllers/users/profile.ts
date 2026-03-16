import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetUserProfileUseCase } from '@/use-cases/factories/make-get-user-profile-use.case'

export const meBodyResponse = {
  200: z
    .object({
      user: z
        .object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          phone: z.string().nullable(),
          passwordHash: z.string(),
          active: z.boolean(),
          role: z.string(),
          createdBy: z.string().nullable(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
        .omit({ passwordHash: true }), // Remove passwordHash da resposta
    })
    .describe('Dados do usuário retornados com sucesso!'),
  401: z.object({ message: z.string() }).describe('Não Autoziado.'),
}

// Função que retorna com dados de user pelo JWT
export async function profile(request: FastifyRequest, reply: FastifyReply) {
  // Inversion Dependency Factoreis Pattern
  const getUserProfile = makeGetUserProfileUseCase()

  const { user } = await getUserProfile.execute({
    userId: request.user.sub,
  })
  return reply.status(200).send({ user: { ...user, passwordHash: undefined } })
}
