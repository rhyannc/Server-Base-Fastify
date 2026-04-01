import { UserSubscription, Plan } from '@prisma/client'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'
import { PlansRepository } from '@/repositories/plans-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface GetMeSubscriptionUseCaseRequest {
  userId: string
}

interface GetMeSubscriptionUseCaseResponse {
  subscription: UserSubscription & {
    plan: Plan
  }
}

export class GetMeSubscriptionUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
  ) {}

  async execute({
    userId,
  }: GetMeSubscriptionUseCaseRequest): Promise<GetMeSubscriptionUseCaseResponse> {
    //Busca a assinatura do usuário
    const subscription = await this.userSubscriptionsRepository.findByUserId(userId)

    if (!subscription) {
      throw new ResourceNotFoundError()
    }

    //Busca o plano da assinatura
    const plan = await this.plansRepository.findById(subscription.planId)

    if (!plan) {
      throw new ResourceNotFoundError()
    }

    return {
      subscription: {
        ...subscription,
        plan,
      },
    }
  }
}
