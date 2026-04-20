import { UserSubscription } from '@prisma/client'

import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'
import { SubscriptionEventsRepository } from '@/repositories/subscription-events-repository'
import { stripe } from '@/providers/stripe-provider'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { SubscriptionNotActiveError } from '../errors/subscription-not-active-error'

interface ResumeUserSubscriptionUseCaseRequest {
  userId: string
}

interface ResumeUserSubscriptionUseCaseResponse {
  userSubscription: UserSubscription
}

export class ResumeUserSubscriptionUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private subscriptionEventsRepository: SubscriptionEventsRepository,
  ) {}

  async execute({
    userId,
  }: ResumeUserSubscriptionUseCaseRequest): Promise<ResumeUserSubscriptionUseCaseResponse> {
    // 1. Busca a assinatura do usuário
    const subscription = await this.userSubscriptionsRepository.findByUserId(userId)

    if (!subscription) {
      throw new ResourceNotFoundError()
    }

    // 2. Verifica se a assinatura está ativa ou em trial
    // Se estiver CANCELED ou EXPIRED, não pode dar "resume", tem que assinar de novo
    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
      throw new SubscriptionNotActiveError()
    }

    // 3. Reativa a renovação no Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      })
      console.log(
        `[Resume Subscription] Renovação reativada no Stripe: ${subscription.stripeSubscriptionId}`,
      )
    }

    // 4. Limpa a data de cancelamento no banco local
    const userSubscription = await this.userSubscriptionsRepository.update({
      id: subscription.id,
      canceledAt: null,
    })

    console.log(
      `[Resume Subscription] Registro de cancelamento limpo no banco local.`,
    )

    // 5. Registra o evento de log
    await this.subscriptionEventsRepository.create({
      userId,
      type: 'MANUAL_ACTION',
      name: 'manual.resume',
      status: 'SUCCESS',
      message: 'Renovação automática reativada pelo usuário.',
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    })

    return {
      userSubscription,
    }
  }
}
