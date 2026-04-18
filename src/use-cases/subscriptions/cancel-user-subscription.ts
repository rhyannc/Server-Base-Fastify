import { UserSubscription } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { stripe } from '@/providers/stripe-provider'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { SubscriptionNotActiveError } from '../errors/subscription-not-active-error'

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

    // 3. Cancela a assinatura no Stripe (agenda para o fim do período)
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
      console.log(
        `[Cancel Subscription] Renovação cancelada no Stripe: ${subscription.stripeSubscriptionId}`,
      )
    }

    // 4. Atualiza o banco local apenas com a data de cancelamento
    // O status permanece ACTIVE até o webhook confirmar a deleção no fim do ciclo
    const userSubscription = await this.userSubscriptionsRepository.update({
      id: subscription.id,
      canceledAt: new Date(),
    })

    console.log(
      `[Cancel Subscription] Marcado como cancelado no banco local. Acesso mantido até o fim do ciclo.`,
    )

    return {
      userSubscription,
      archivedCompanyIds: [],
    }
  }
}
