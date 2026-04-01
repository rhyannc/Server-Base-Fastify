import { Usage, UsageMetric } from '@prisma/client'

import { UsagesRepository } from '@/repositories/usages-repository'

interface DecrementUsageUseCaseRequest {
  userId: string
  metric: UsageMetric
}

interface DecrementUsageUseCaseResponse {
  usage: Usage | null
}

export class DecrementUsageUseCase {
  constructor(private usagesRepository: UsagesRepository) {}

  async execute({
    userId,
    metric,
  }: DecrementUsageUseCaseRequest): Promise<DecrementUsageUseCaseResponse> {
    const now = new Date()
    const period = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )

    let usage = await this.usagesRepository.findByUserIdAndMetric(
      userId,
      metric,
      period,
    )

    if (usage && usage.value > 0) {
      usage = await this.usagesRepository.decrement(usage.id, 1)
    }

    return { usage }
  }
}
