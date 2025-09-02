import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const autenticateBodyResponse = {
  200: z
    .object({ token: z.string() })
    .describe('Usuario Autenticado com sucesso!'),
  400: z.object({ message: z.string() }).describe('Credenciais Invalidas'),
}

// Função assíncrona que lida com a requisição de registro de um novo usuário
export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify({ onlyCookie: true })

  const { role } = request.user

  // Cria Token
  const token = await reply.jwtSign(
    {
      role, // Sala o tipo de User ADMIN ou MEMBRO
    },
    {
      sign: {
        sub: request.user.sub,
      },
    },
  )

  // Cria refreshToken para revalidar um token apos 7 dias
  const refreshToken = await reply.jwtSign(
    {
      role,
    },
    {
      sign: {
        sub: request.user.sub,
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
    .send({ token })
}
