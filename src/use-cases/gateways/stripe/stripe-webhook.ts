import Stripe from 'stripe'
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-respository'
import { PrismaUserSubscriptionsRepository } from '../../../repositories/prisma/prisma-user-subscriptions-repository'
import { stripe } from '../../../providers/stripe-provider'
import { prisma } from '../../../lib/prisma'

interface StripeWebhookUseCaseRequest {
  event: Stripe.Event
}

export class StripeWebhookUseCase {
  constructor(
    private usersRepository: PrismaUsersRepository,
    private userSubscriptionsRepository: PrismaUserSubscriptionsRepository,
  ) {} 

  async execute({ event }: StripeWebhookUseCaseRequest): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Verifica se a sessão é de assinatura e se tem uma assinatura
        if (session.mode === 'subscription' && session.subscription) {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          
          const userId = session.client_reference_id
          
          if (userId) {
            // Busca o usuário pelo ID
            const user = await this.usersRepository.findById(userId)
            
            if (user) {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId)
              const stripePriceId = subscription.items.data[0].price.id

              const plan = await prisma.plan.findFirst({
                where: { stripePriceId }
              })

              // Se não encontrar o plano, lança um erro
              if (!plan) {
                console.error(`Plan not found for stripePriceId ${stripePriceId}`)
                break
              }
              
              // Busca a assinatura pelo ID
              const existingSubscription = await this.userSubscriptionsRepository.findByUserId(userId)
              
              if (existingSubscription) {
                await this.userSubscriptionsRepository.update({
                  id: existingSubscription.id,
                  planId: plan.id,
                  stripeSubscriptionId: subscriptionId,
                  stripePriceId: stripePriceId,
                  status: 'ACTIVE',
                })
              } else {
                await this.userSubscriptionsRepository.create({
                  userId: user.id,
                  planId: plan.id,
                  stripeSubscriptionId: subscriptionId,
                  stripePriceId: stripePriceId,
                  status: 'ACTIVE',
                })
              }

              user.chosePlan = true
              await this.usersRepository.update(user)
            }
          }
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const existingSub = await prisma.userSubscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        })

        if (existingSub) {
          // Update status based on Stripe subscription status
          const statusMap: Record<string, 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'> = {
            active: 'ACTIVE',
            trialing: 'TRIALING',
            past_due: 'PAST_DUE',
            canceled: 'CANCELED',
            unpaid: 'PAST_DUE',
          }

          const newStatus = statusMap[subscription.status] || 'PAST_DUE'
          
          await this.userSubscriptionsRepository.update({
             id: existingSub.id,
             status: newStatus
          })
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        // Busca a assinatura pelo ID
        const existingSub = await prisma.userSubscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        })

        // Se encontrar a assinatura, atualiza o status para cancelado
        if (existingSub) {
          await this.userSubscriptionsRepository.update({
             id: existingSub.id,
             status: 'CANCELED'
          })
        }
        break
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  }
}
