import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeVerifyEmailUseCase } from '@/use-cases/factories/make-verify-email-use-case'

export const verifyEmailBodySchema = z.object({
  token: z.string().uuid(),
})

export const verifyEmailBodyResponse = {
  200: z.object({
    message: z.string(),
  }),
}

export async function verifyEmail(
  request: FastifyRequest<{ Body: z.infer<typeof verifyEmailBodySchema> }>,
  reply: FastifyReply,
) {
  const { token } = request.body

  const verifyEmailUseCase = makeVerifyEmailUseCase()

  await verifyEmailUseCase.execute({ token })

  return reply.status(200).send({ message: 'E-mail verificado com sucesso.' })
}
