import { SubscriptionStatus, UserSubscription } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { PlanNotActiveError } from './errors/plan-not-active-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UserSubscriptionAlreadyExistsError } from './errors/user-subscription-already-exists-error'
import { UserSubscriptionNotExistsPlanError } from './errors/user-subscription-not-exists-plan-error'

interface UpdateUserSubscriptionUseCaseRequest {
  userId: string
  planId?: string
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

    // Verifica se o usuario ja tem plano
    const userSubscription =
      await this.userSubscriptionsRepository.findByUserId(userId)
    if (!userSubscription) {
      throw new ResourceNotFoundError()
    }

    //verificar se o plano existe e se esta ativo
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
