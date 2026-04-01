import { Usage, UsageMetric } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { PlanLimitReachedError } from '../errors/plan-limit-reached-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface CheckAndIncrementUsageUseCaseRequest {
  userId: string
  metric: UsageMetric
}

interface CheckAndIncrementUsageUseCaseResponse {
  usage: Usage
}

export class CheckAndIncrementUsageUseCase {
  constructor(
    private usagesRepository: UsagesRepository,
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
  ) {}

  async execute({
    userId,
    metric,
  }: CheckAndIncrementUsageUseCaseRequest): Promise<CheckAndIncrementUsageUseCaseResponse> {
    // Busca assinatura do usuário
    const subscription =
      await this.userSubscriptionsRepository.findByUserId(userId)

    // Se não tiver assinatura, lança erro
    if (!subscription) {
      throw new ResourceNotFoundError()
    }

    // Busca plano da assinatura
    const plan = await this.plansRepository.findById(subscription.planId)

    if (!plan) {
      throw new ResourceNotFoundError()
    }

    // Define o limite baseado na métrica
    let limit: number | null = null
    if (metric === UsageMetric.COMPANIES) {
      limit = plan.maxCompanies
    } else if (metric === UsageMetric.COLLABORATORS) {
      limit = plan.maxCollaborators
    } else if (metric === UsageMetric.INVOICES) {
      limit = plan.maxInvoices
    }

    const now = new Date()
    const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

    let usage = await this.usagesRepository.findByUserIdAndMetric(
      userId,
      metric,
      period,
    )

    if (limit !== null && usage && usage.value >= limit) {
      throw new PlanLimitReachedError(metric)
    }

    if (usage) {
      usage = await this.usagesRepository.increment(usage.id, 1)
    } else {
      usage = await this.usagesRepository.create({
        userId,
        metric,
        period,
        value: 1,
      })
    }

    return { usage }
  }
}
