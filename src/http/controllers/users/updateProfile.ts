import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { makeUpdateUserProfileUseCase } from '@/use-cases/factories/make-update-user-profile-use-case'

export const updateProfileBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  password: z.string().min(6, 'Mínimo de 6 caracteres').optional(),
  avatar: z.string().nullable().optional(),
})

export const updateProfileBodyResponse = {
  201: z
    .object({ userId: z.string().uuid() })
    .describe('Perfil atualizado com sucesso!'),
  409: z.object({ message: z.string() }).describe('E-mail já existente'),
}

export async function updateProfile(request: FastifyRequest, reply: FastifyReply) {
  const data = updateProfileBodySchema.parse(request.body)

  try {
    const updateProfileUseCase = makeUpdateUserProfileUseCase()

    const { user } = await updateProfileUseCase.execute({
      id: request.user.sub, // Garante que atualiza apenas o logado
      ...data,
    })

    return reply.status(201).send({ userId: user.id })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}
