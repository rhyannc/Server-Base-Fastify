import { FastifyReply, FastifyRequest } from 'fastify'
import Stripe from 'stripe'
import { env } from '../../../env'
import { stripe } from '../../../providers/stripe-provider'
import { makeStripeWebhookUseCase } from '../../../use-cases/factories/make-stripe-webhook-use-case'

export async function handleStripeWebhook(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const signature = request.headers['stripe-signature']

  console.log("inicio da assinatura")

  // Verifica se a assinatura está presente
  if (!signature) {
    return reply.status(400).send({ message: 'Missing stripe-signature header' })
  }

  let event: Stripe.Event

  try {
    // fastify-raw-body insere o texto puro em request.rawBody
    const rawBody = (request as any).rawBody
    
    if (!rawBody) {
      console.error('⚠️ rawBody está undefined! O plugin fastify-raw-body pode não estar funcionando.')
      console.error('request.body type:', typeof request.body)
    }

    // Usa rawBody (string) diretamente — NÃO pode usar JSON.stringify pois altera a formatação
    // e invalida a assinatura do Stripe
    const payload = typeof rawBody === 'string' ? rawBody : JSON.stringify(request.body)
    
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    )
    console.log("✅ Assinatura do webhook verificada com sucesso")
  } catch (err) {
    if (err instanceof Error) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`)
      console.error('💡 Verifique se o STRIPE_WEBHOOK_SECRET no .env corresponde ao secret mostrado pelo "stripe listen"')
    }
    return reply.status(400).send({ message: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` })
  }

  try {
    const stripeWebhookUseCase = makeStripeWebhookUseCase()

    await stripeWebhookUseCase.execute({
      event,
    })

    return reply.status(200).send({ received: true })
  } catch (err) {
    console.error(`Error handling webhook event:`, err)
    return reply.status(500).send({ message: 'Internal Server Error' })
  }
}
