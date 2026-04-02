import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeForgotPasswordUseCase } from '@/use-cases/factories/make-forgot-password-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
})

export const forgotPasswordBodyResponse = {
  200: z.object({
    message: z.string(),
  }),
}

export async function forgotPassword(
  request: FastifyRequest<{ Body: z.infer<typeof forgotPasswordBodySchema> }>,
  reply: FastifyReply,
) {
  const { email } = request.body

  try {
    const forgotPasswordUseCase = makeForgotPasswordUseCase()
    await forgotPasswordUseCase.execute({ email })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      // Ignoramos caso o email não exista por razões de segurança, para não vazar emails cadastrados
    } else {
      throw error
    }
  }

  return reply.status(200).send({ message: 'Se o e-mail estiver cadastrado, as instruções foram enviadas.' })
}
