import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFetchUserUsagesUseCase } from '@/use-cases/factories/make-fetch-user-usages-use-case'

export const userMetricsParamsSchema = z.object({
  userId: z.string().uuid(),
})

export async function userMetrics(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = userMetricsParamsSchema.parse(request.params)

  const fetchUserUsagesUseCase = makeFetchUserUsagesUseCase()

  const { usages } = await fetchUserUsagesUseCase.execute({
    userId,
  })

  return reply.status(200).send({ usages })
}
