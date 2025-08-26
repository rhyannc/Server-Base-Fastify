import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists'
import { RegisterUseCase } from '@/use-cases/register'

export const registerBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerBodyResponse = {
  201: z
    .object({ userId: z.uuid() })
    .describe('Usuario registrado com sucesso!'),
  409: z.object({ message: z.string() }).describe('E-mail já existente'),
}

// Função assíncrona que lida com a requisição de registro de um novo usuário
export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    const prismaUsersRepository = new PrismaUsersRepository()
    const registerUseCase = new RegisterUseCase(prismaUsersRepository)

    const user = await registerUseCase.execute({ name, email, password })
    return reply.status(201).send({ userId: user.id }) // 👉 retorna o ID
  } catch (err) {
    // Retorna um erro 409 (Conflito) caso o e-mail já esteja cadastrado
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}
