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

  // Verifica se a assinatura está presente
  if (!signature) {
    return reply.status(400).send({ message: 'Missing stripe-signature header' })
  }

  let event: Stripe.Event

  try {
    // fastify-raw-body insere o texto puro em request.rawBody
    const payload = (request as any).rawBody || request.body
    
    event = stripe.webhooks.constructEvent(
      typeof payload === 'string' ? payload : JSON.stringify(payload),
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return reply.status(400).send({ message: `Webhook Error: ${err.message}` })
    }
    return reply.status(400).send({ message: 'Webhook Error' })
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
