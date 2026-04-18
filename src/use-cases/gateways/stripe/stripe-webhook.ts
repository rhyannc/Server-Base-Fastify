import { SubscriptionStatus } from '@prisma/client'
import Stripe from 'stripe'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { InvoicesRepository } from '@/repositories/invoices-repository'

import { prisma } from '../../../lib/prisma'
import { stripe } from '../../../providers/stripe-provider'
import { PrismaUserSubscriptionsRepository } from '../../../repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-respository'
import { CreateInvoiceUseCase } from '../../subscriptions/create-invoice'
import { SubscriptionCanceledUseCase } from './subscription-canceled'

interface StripeWebhookUseCaseRequest {
  event: Stripe.Event
}

export class StripeWebhookUseCase {
  constructor(
    private usersRepository: PrismaUsersRepository,
    private userSubscriptionsRepository: PrismaUserSubscriptionsRepository,
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private invoicesRepository: InvoicesRepository,
  ) {}

  async execute({ event }: StripeWebhookUseCaseRequest): Promise<void> {
    console.log(`[Stripe Webhook- INITIALs] Evento recebido: ${event.type}`)

    switch (event.type) {

     

      // Checkout Session Completed - Cria a assinatura
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Stripe Webhook] session.mode: ${session.mode}, session.subscription: ${session.subscription}`,)
    
        // Verifica se a sessão é de assinatura e se tem uma assinatura
        if (session.mode === 'subscription' && session.subscription) {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          const userId = session.client_reference_id

          const result = await stripe.subscriptions.retrieve(subscriptionId) as any

          // DATA FINAL DO CICLO DE PAGAMENTO
          const finalTimestamp = result.current_period_end || result.items?.data[0]?.current_period_end;


          console.log(
            `[Stripe Webhook] customerId: ${customerId}, subscriptionId: ${subscriptionId}, userId: ${userId}`,
          )

          if (userId) {
            // Busca o usuário pelo ID
            const user = await this.usersRepository.findById(userId)
            console.log(
              `[Stripe Webhook] Usuário encontrado: ${user ? user.id : 'NÃO ENCONTRADO'}`,
            )

            if (user) {
              const subscription =
                await stripe.subscriptions.retrieve(subscriptionId)
              const stripePriceId = subscription.items.data[0].price.id


 
              console.log(
                `[Stripe Webhook 67] stripePriceId da assinatura Stripe: ${stripePriceId}`,
              )

              // Busca o plano no banco pelo stripePriceId
              const plan = await prisma.plan.findFirst({
                where: { stripePriceId },
              })
              console.log(
                `[Stripe Webhook] Plano encontrado no banco: ${plan ? plan.id : 'NÃO ENCONTRADO'}`,
              )

              // Se não encontrar o plano, lança um erro
              if (!plan) {
                console.error(
                  `[Stripe Webhook] ERRO: Plano não encontrado para stripePriceId=${stripePriceId}`,
                )
                break
              }

              // --- CAPTURA DE DADOS DO CARTÃO ---
              let cardLast4: string | null = null
              let cardBrand: string | null = null

              console.log(
                `[Stripe Webhook] Buscando dados do cartão. PaymentIntent: ${session.payment_intent}, SetupIntent: ${session.setup_intent}`,
              )

              if (session.payment_intent) {
                const paymentIntent = await stripe.paymentIntents.retrieve(
                  session.payment_intent as string,
                  { expand: ['payment_method'] },
                )
                const paymentMethod =
                  paymentIntent.payment_method as Stripe.PaymentMethod
                if (paymentMethod && paymentMethod.card) {
                  cardLast4 = paymentMethod.card.last4
                  cardBrand = paymentMethod.card.brand
                }
              } else if (session.setup_intent) {
                const setupIntent = await stripe.setupIntents.retrieve(
                  session.setup_intent as string,
                  { expand: ['payment_method'] },
                )
                const paymentMethod =
                  setupIntent.payment_method as Stripe.PaymentMethod
                if (paymentMethod && paymentMethod.card) {
                  cardLast4 = paymentMethod.card.last4
                  cardBrand = paymentMethod.card.brand
                }
              }

              // Fallback: Tenta buscar na própria assinatura se ainda estiver vazio
              if (!cardLast4 && subscription.default_payment_method) {
                console.log(
                  `[Stripe Webhook] Tentando buscar default_payment_method da assinatura: ${subscription.default_payment_method}`,
                )
                const paymentMethod = await stripe.paymentMethods.retrieve(
                  subscription.default_payment_method as string,
                )
                if (paymentMethod.card) {
                  cardLast4 = paymentMethod.card.last4
                  cardBrand = paymentMethod.card.brand
                }
              }

              console.log(
                `[Stripe Webhook] Dados finais do cartão - Brand: ${cardBrand}, Last4: ${cardLast4}`,
              )

              // Busca a assinatura pelo ID
              const existingSubscription =
                await this.userSubscriptionsRepository.findByUserId(userId)
              console.log(
                `[Stripe Webhook] Assinatura existente: ${existingSubscription ? existingSubscription.id : 'NENHUMA'}`,
              )

              // Cria ou atualiza a assinatura UserSubscription
              if (existingSubscription) {
                await this.userSubscriptionsRepository.update({
                  id: existingSubscription.id,
                  planId: plan.id,
                  stripeSubscriptionId: subscriptionId,
                  stripePriceId,
                  status: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
                  cardLast4,
                  cardBrand,
                  expiresAt: new Date(finalTimestamp * 1000),
                })
                console.log(
                  `[Stripe Webhook] Assinatura ATUALIZADA com sucesso.`,
                )
              } else {
                await this.userSubscriptionsRepository.create({
                  userId: user.id,
                  planId: plan.id,
                  stripeSubscriptionId: subscriptionId,
                  stripePriceId,
                  status: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
                  cardLast4,
                  cardBrand,
                  expiresAt: new Date(finalTimestamp * 1000),
                })
                console.log(`[Stripe Webhook] Assinatura CRIADA com sucesso.`)

              }

              // Criação da invoice para historico de pagamentos
              const createInvoiceUseCase = new CreateInvoiceUseCase(
                this.invoicesRepository,
              )
              await createInvoiceUseCase.execute({
                userId: user.id,
                planId: plan.id,
                status: SubscriptionStatus.ACTIVE,
                stripeSubscriptionId: subscriptionId,
                stripePriceId,
                price: Number(plan.price),
                currency: 'BRL',
                startedAt: new Date(),
                cardLast4,
                cardBrand,
              })
              console.log(`[Stripe Webhook 01-INVOICE] Invoice registrada com sucesso.`)

             if(subscription.status === 'trialing') {
              user.trialUsed = true // Marca que o user usou o periodo de demostracao
             }  

              user.chosePlan = true // Indica que o usuário escolheu um plano
              await this.usersRepository.update(user)
              console.log(
                `[Stripe Webhook] chosePlan atualizado para true. Fluxo concluído!`,
              )
            } else {
              console.error(
                `[Stripe Webhook] ERRO: Usuário não encontrado para userId=${userId}`,
              )
            }
          } else {
            console.error(
              `[Stripe Webhook] ERRO: client_reference_id ausente na sessão!`,
            )
          }
        } else {
          console.warn(
            `[Stripe Webhook] Sessão ignorada — mode=${session.mode}, subscription=${session.subscription}`,
          )
        }
        break
      }



      // Customer Subscription Updated - Atualiza a assinatura
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const stripePriceId = subscription.items.data[0].price.id
        const finalTimestamp =  subscription.items?.data[0]?.current_period_end;

        console.log('AQUI ESTA O FINAL TIMESTAMP ******** seja renovação ou pro-rata', finalTimestamp)

        const existingSub =
          await this.userSubscriptionsRepository.findByStripeSubscriptionId(
            subscription.id,
          )

        if (existingSub) {
          const statusMap: Record<
            string,
            'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
          > = {
            active: 'ACTIVE',
            trialing: 'TRIALING',
            past_due: 'PAST_DUE',
            canceled: 'CANCELED',
            unpaid: 'PAST_DUE',
          }

          const newStatus = statusMap[subscription.status] || 'PAST_DUE'

          let planId = existingSub.planId

          // Se o preço mudou, busca o novo plano no banco
          if (stripePriceId !== existingSub.stripePriceId) {
            const plan = await prisma.plan.findFirst({
              where: { stripePriceId },
            })
            if (plan) {
              planId = plan.id
            }
          }

          // Atualiza a assinatura no banco (apenas dados da assinatura)
          await this.userSubscriptionsRepository.update({
            id: existingSub.id,
            status: newStatus,
            planId,
            stripePriceId,
            cardLast4: subscription.default_payment_method
              ? (
                  await stripe.paymentMethods.retrieve(
                    subscription.default_payment_method as string,
                  )
                ).card?.last4
              : undefined,
            cardBrand: subscription.default_payment_method
              ? (
                  await stripe.paymentMethods.retrieve(
                    subscription.default_payment_method as string,
                  )
                ).card?.brand
              : undefined,
            expiresAt: new Date(finalTimestamp * 1000),
            canceledAt: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000) 
              : null,
          })

          console.log(`[Stripe Webhook- UPDATE DE PLANO] Assinatura sincronizada. O pagamento será registrado pelo evento invoice.payment_succeeded.`)
        }
        break
      }

      // Customer Subscription Deleted - Cancela a assinatura
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const existingSub =
          await this.userSubscriptionsRepository.findByStripeSubscriptionId(
            subscription.id,
          )

        if (existingSub) {
          // Usa o use case de cancelamento para garantir que as empresas sejam arquivadas
          const subscriptionCanceledUseCase = new SubscriptionCanceledUseCase(
            this.userSubscriptionsRepository,
            this.companiesRepository,
            this.collaboratorsRepository,
          )

          await subscriptionCanceledUseCase.execute({
            userId: existingSub.userId,
          })
        }
        break
      }

      // Invoice Payment Succeeded - Registra a fatura no banco (seja renovação ou pro-rata)
      case 'invoice.payment_succeeded': {
        const stripeInvoice = event.data.object as any

        console.log(`[Stripe Webhook INVOICE] Processando invoice: ${stripeInvoice.id} (${stripeInvoice.billing_reason})`)

        console.log(stripeInvoice)

        // Tenta pegar o ID da assinatura de vários lugares possíveis (pode estar no parent em alguns updates)
        const subscriptionId = stripeInvoice.subscription || 
                               stripeInvoice.parent?.subscription_details?.subscription;

        console.log('AQUI ESTA O SUB ID ******** seja renovação ou pro-rata', subscriptionId)

        if (subscriptionId) {
          // Busca o stripePriceId em todas as linhas da fatura, ignorando créditos
          const lines = stripeInvoice.lines?.data || []
          let stripePriceId: string | null = null

          for (const line of lines) {
            // Tenta pegar o ID do preço de várias fontes possíveis
            const currentPriceId = line.price?.id || 
                                   line.price || 
                                   line.pricing?.price_details?.price ||
                                   line.plan?.id

            // Escolhemos o primeiro ID que for positivo, ou o último caso todos sejam negativos
            if (currentPriceId) {
              stripePriceId = currentPriceId
              if (line.amount > 0) break // Prioriza a linha de cobrança (não o crédito)
            }
          }

          // Busca a assinatura no banco usando o ID da Stripe
          const existingSub =
            await this.userSubscriptionsRepository.findByStripeSubscriptionId(
              subscriptionId,
            )

          if (existingSub && stripePriceId) {
            let cardLast4: string | null = null
            let cardBrand: string | null = null

            // Busca os dados do cartão no payment intent
            if (stripeInvoice.payment_intent) {
              const paymentIntentId = typeof stripeInvoice.payment_intent === 'string' 
                ? stripeInvoice.payment_intent 
                : stripeInvoice.payment_intent.id

              const paymentIntent = await stripe.paymentIntents.retrieve(
                paymentIntentId,
                { expand: ['payment_method'] },
              )
              const paymentMethod =
                paymentIntent.payment_method as Stripe.PaymentMethod

              if (paymentMethod && paymentMethod.card) {
                cardLast4 = paymentMethod.card.last4
                cardBrand = paymentMethod.card.brand
              }
            }

            // Fallback: Busca na assinatura se necessário
            if (!cardLast4) {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId)
              if (subscription.default_payment_method) {
                const paymentMethod = await stripe.paymentMethods.retrieve(
                  subscription.default_payment_method as string,
                )
                if (paymentMethod.card) {
                  cardLast4 = paymentMethod.card.last4
                  cardBrand = paymentMethod.card.brand
                }
              }
            }

            // Criação da invoice para historico de pagamentos
            const createInvoiceUseCase = new CreateInvoiceUseCase(
              this.invoicesRepository,
            )

            await createInvoiceUseCase.execute({
              userId: existingSub.userId,
              planId: existingSub.planId,
              status: SubscriptionStatus.ACTIVE,
              stripeSubscriptionId: subscriptionId,
              stripePriceId,
              price: stripeInvoice.amount_paid / 100, // Valor total pago em Reais
              currency: stripeInvoice.currency.toUpperCase(),
              startedAt: new Date(),
              cardLast4: cardLast4 || existingSub.cardLast4,
              cardBrand: cardBrand || existingSub.cardBrand,
            })
            console.log(`[Stripe Webhook 02-INVOICE] Invoice de ${stripeInvoice.billing_reason} registrada com sucesso. Valor: R$ ${stripeInvoice.amount_paid / 100}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  }
}
