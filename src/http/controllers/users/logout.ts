import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export const logoutBodyResponse = {
  200: z
    .object({ message: z.string() })
    .describe('Usuário deslogado com sucesso!'),
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  return reply
    .clearCookie('refreshToken', {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({ message: 'Logout realizado com sucesso!' })
}
