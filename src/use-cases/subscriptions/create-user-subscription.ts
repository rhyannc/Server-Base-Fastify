import { SubscriptionStatus, UserSubscription } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'
import { UsersRepository } from '@/repositories/users-repository'

import { PlanNotActiveError } from '../errors/plan-not-active-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UserSubscriptionAlreadyExistsError } from '../errors/user-subscription-already-exists-error'

interface CreateUserSubscriptionUseCaseRequest {
  userId: string
  planId: string
  status?: SubscriptionStatus
}

interface CreateUserSubscriptionUseCaseResponse {
  userSubscription: UserSubscription
}

export class CreateUserSubscriptionUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private usersRepository: UsersRepository,
    private plansRepository: PlansRepository,
  ) {}

  async execute({
    userId,
    planId,
    status = 'ACTIVE',
  }: CreateUserSubscriptionUseCaseRequest): Promise<CreateUserSubscriptionUseCaseResponse> {
    // verificar se o usuario existe
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    const plan = await this.plansRepository.findById(planId)
    if (!plan) {
      throw new ResourceNotFoundError()
    }

    if (!plan.isActive) {
      throw new PlanNotActiveError()
    }

    // verificar se o usuario ja tem uma assinatura
    const subscriptionExists =
      await this.userSubscriptionsRepository.findByUserId(userId)

    if (subscriptionExists) {
      throw new UserSubscriptionAlreadyExistsError()
    }

    const userSubscription = await this.userSubscriptionsRepository.create({
      userId,
      planId,
      status,
    })

    // atualizar o campo chosePlan do usuario para true
    const updatedUser = await this.usersRepository.update({
      id: user.id,
      chosePlan: true,
      updatedAt: user.updatedAt, // Nao altera o updatedAt, deixando apenas para quando o usuario for atualizado
    })

    return { userSubscription }
  }
}
