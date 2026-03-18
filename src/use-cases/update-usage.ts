import { Usage, UsageMetric } from '@prisma/client'

import { UsagesRepository } from '@/repositories/usages-repository'

import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UpdateUsageUseCaseRequest {
  userId: string
  metric: UsageMetric
  value: number
}

interface UpdateUsageUseCaseResponse {
  usage: Usage
}

export class UpdateUsageUseCase {
  constructor(private usagesRepository: UsagesRepository) {}

  async execute({
    userId,
    metric,
    value,
  }: UpdateUsageUseCaseRequest): Promise<UpdateUsageUseCaseResponse> {
    const now = new Date()
    const period = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )

    const usage = await this.usagesRepository.findByUserIdAndMetric(
      userId,
      metric,
      period,
    )

    if (!usage) {
      // Se não existir, a gente cria com o valor forçado (raro, mas possível se for o primeiro uso do mês)
      const newUsage = await this.usagesRepository.create({
        userId,
        metric,
        period,
        value,
      })
      return { usage: newUsage }
    }

    const updatedUsage = await this.usagesRepository.setValue(usage.id, value)

    return { usage: updatedUsage }
  }
}
