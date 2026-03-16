import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateUserUseCase } from '@/use-cases/factories/make-update-user-use-case'

export const updateUserBodySchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  active: z.boolean().optional(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  password: z.string().min(6, 'Minimo de 6 carateres').optional(),
})

export const updateUserBodyResponse = {
  201: z
    .object({ userId: z.string().uuid() })
    .describe('Usuário atualizado com sucesso!'),
}

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  const data = updateUserBodySchema.parse(request.body)

  const updateUserUseCase = makeUpdateUserUseCase()

  const { user } = await updateUserUseCase.execute(data)

  return reply.status(201).send({ userId: user.id })
}
