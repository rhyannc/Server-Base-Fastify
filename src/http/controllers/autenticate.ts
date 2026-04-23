import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate-use-case'

export const autenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const autenticateBodyResponse = {
  200: z
    .object({ token: z.string() })
    .describe('Usuario Autenticado com sucesso!'),
  400: z.object({ message: z.string() }).describe('Credenciais Invalidas'),
}

// Função assíncrona que lida com a requisição de registro de um novo usuário
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { email, password } = autenticateBodySchema.parse(request.body)

  try {
    // Inversion Dependency Factoreis Pattern
    const authenticateUseCase = makeAuthenticateUseCase()

    const { user } = await authenticateUseCase.execute({
      email,
      password,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    })

    // Cria Token
    const token = await reply.jwtSign(
      {
        role: user.role, // Sala o tipo de User ADMIN ou MEMBRO
      },
      {
        sign: {
          sub: user.id,
        },
      },
    )

    // Cria refreshToken para revalidar um token apos 7 dias
    const refreshToken = await reply.jwtSign(
      {
        role: user.role, // Sala o tipo de User ADMIN ou MEMBRO
      },
      {
        sign: {
          sub: user.id,
          expiresIn: '7d',
        },
      },
    )

    return reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: true, // DEFINE QUE O NOSSO COOKIE VAI SER ENCRIPTADO PELO HTTPS
        sameSite: true, // COOKIE SÓ É ACESSÍVEL DENTRO DO MESMO DOMÍNIO
        httpOnly: true, // COOKIE SÓ PODE SER ACESSADO DO BACK-END DA APLICAÇÃO
      })
      .status(200)
      .send({ token }) // 👉 retorna o TOKEN
  } catch (err) {
    // Retorna um erro 409 (Conflito) caso o e-mail já esteja cadastrado
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message })
    }

    throw err
  }
}
