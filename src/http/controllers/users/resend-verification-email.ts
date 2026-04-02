import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeResendVerificationEmailUseCase } from '@/use-cases/factories/make-resend-verification-email-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export const resendVerificationEmailBodySchema = z.object({
  email: z.string().email(),
})

export const resendVerificationEmailBodyResponse = {
  200: z.object({
    message: z.string(),
  }),
}

export async function resendVerificationEmail(
  request: FastifyRequest<{ Body: z.infer<typeof resendVerificationEmailBodySchema> }>,
  reply: FastifyReply,
) {
  const { email } = request.body

  try {
    const resendVerificationEmailUseCase = makeResendVerificationEmailUseCase()
    await resendVerificationEmailUseCase.execute({ email })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      // Ignora erro para não vazar emails
    } else {
      throw error
    }
  }

  return reply.status(200).send({ message: 'Se o e-mail não estiver ativado, um novo link de verificação foi enviado.' })
}
