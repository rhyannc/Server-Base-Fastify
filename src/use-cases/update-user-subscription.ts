import { SubscriptionStatus, UserSubscription } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { PlanNotActiveError } from './errors/plan-not-active-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UpdateUserSubscriptionUseCaseRequest {
  userId: string
  planId?: number
  status?: SubscriptionStatus
}

interface UpdateUserSubscriptionUseCaseResponse {
  userSubscription: UserSubscription
}

export class UpdateUserSubscriptionUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
  ) {}

  async execute({
    userId,
    planId,
    status,
  }: UpdateUserSubscriptionUseCaseRequest): Promise<UpdateUserSubscriptionUseCaseResponse> {
    const userSubscription =
      await this.userSubscriptionsRepository.findByUserId(userId)

    if (!userSubscription) {
      throw new ResourceNotFoundError()
    }

    if (planId) {
      const plan = await this.plansRepository.findById(planId)
      if (!plan) {
        throw new ResourceNotFoundError()
      }

      if (!plan.isActive) {
        throw new PlanNotActiveError()
      }
      
      userSubscription.planId = planId
    }

    if (status) {
      userSubscription.status = status
    }

    const updatedSubscription = await this.userSubscriptionsRepository.update({
      id: userSubscription.id,
      planId: userSubscription.planId,
      status: userSubscription.status,
    })

    return { userSubscription: updatedSubscription }
  }
}
