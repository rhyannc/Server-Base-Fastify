import { UsageMetric } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateUsageUseCase } from '@/use-cases/factories/make-update-usage-use-case'

export const updateMetricParamsSchema = z.object({
  userId: z.string().uuid(),
  metric: z.enum(['COMPANIES', 'COLLABORATORS', 'INVOICES']),
})

export const updateMetricBodySchema = z.object({
  value: z.number().int().min(0),
})

export async function updateMetric(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId, metric } = updateMetricParamsSchema.parse(request.params)
  const { value } = updateMetricBodySchema.parse(request.body)

  const updateUsageUseCase = makeUpdateUsageUseCase()

  const { usage } = await updateUsageUseCase.execute({
    userId,
    metric: metric as UsageMetric,
    value,
  })

  return reply.status(200).send({ usage })
}
