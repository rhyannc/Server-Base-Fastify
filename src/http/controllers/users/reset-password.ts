import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeResetPasswordUseCase } from '@/use-cases/factories/make-reset-password-use-case'

export const resetPasswordBodySchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(6),
})

export const resetPasswordBodyResponse = {
  200: z.object({
    message: z.string(),
  }),
}

export async function resetPassword(
  request: FastifyRequest<{ Body: z.infer<typeof resetPasswordBodySchema> }>,
  reply: FastifyReply,
) {
  const { token, password } = request.body

  const resetPasswordUseCase = makeResetPasswordUseCase()

  await resetPasswordUseCase.execute({ token, password })

  return reply.status(200).send({ message: 'Senha redefinida com sucesso.' })
}
