import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { makeRegisterUseCase } from '@/use-cases/factories/make-register-use-case'

export const registerBodySchema = z.object({
  name: z.string(),
  email: z.string().email('E-mail Invalido!'),
  phone: z.string().min(10, 'Numero incompleto, pelomenos 10 caracteres!'),
  password: z.string().min(6, 'Minimo de 6 carateres'),
  createdBy: z.string().optional().describe('Criado por)'),
})

export const registerBodyResponse = {
  201: z
    .object({ userId: z.uuid() })
    .describe('Usuario registrado com sucesso!'),
  409: z.object({ message: z.string() }).describe('E-mail já existente'),
}

// Função assíncrona que lida com a requisição de registro de um novo usuário
export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, phone, password, createdBy } =
    registerBodySchema.parse(request.body)

  try {
    // Inversion Dependency Factoreis Pattern
    const registerUseCase = makeRegisterUseCase()

    const { user } = await registerUseCase.execute({
      name,
      email,
      phone,
      password,
      createdBy: createdBy ?? '',
    })
    return reply.status(201).send({ userId: user.id }) // 👉 retorna o ID
  } catch (err) {
    // Retorna um erro 409 (Conflito) caso o e-mail já esteja cadastrado
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}
