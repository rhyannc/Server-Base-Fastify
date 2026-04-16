import { UserSubscription } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { stripe } from '@/providers/stripe-provider'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { SubscriptionNotActiveError } from '../errors/subscription-not-active-error'
import { SubscriptionCanceledUseCase } from '../gateways/stripe/subscription-canceled'

interface CancelUserSubscriptionUseCaseRequest {
  userId: string
}

interface CancelUserSubscriptionUseCaseResponse {
  userSubscription: UserSubscription
  archivedCompanyIds: string[]
}

export class CancelUserSubscriptionUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async execute({
    userId,
  }: CancelUserSubscriptionUseCaseRequest): Promise<CancelUserSubscriptionUseCaseResponse> {
    // 1. Busca a assinatura do usuário
    const subscription =
      await this.userSubscriptionsRepository.findByUserId(userId)

    if (!subscription) {
      throw new ResourceNotFoundError()
    }

    // 2. Verifica se a assinatura está ativa (só pode cancelar se estiver ativa ou em trial)
    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
      throw new SubscriptionNotActiveError()
    }

    // 3. Cancela a assinatura no Stripe (se existir stripeSubscriptionId)
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
      console.log(
        `[Cancel Subscription] Assinatura cancelada no Stripe: ${subscription.stripeSubscriptionId}`,
      )
    }

    // 4. Executa a mesma lógica de cancelamento local (status, arquivar empresas e colaboradores)
    const subscriptionCanceledUseCase = new SubscriptionCanceledUseCase(
      this.userSubscriptionsRepository,
      this.companiesRepository,
      this.collaboratorsRepository,
    )

    const result = await subscriptionCanceledUseCase.execute({ userId })

    console.log(
      `[Cancel Subscription] Cancelamento local concluído. Empresas arquivadas: ${result.archivedCompanyIds.length}`,
    )

    return result
  }
}
