import Stripe from 'stripe'
import { env } from '../env' 

// Inicializa a conexão com o Stripe
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
  appInfo: {
    name: 'SaaS Locacao',
  },
})
