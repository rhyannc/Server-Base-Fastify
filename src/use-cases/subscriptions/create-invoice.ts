import { Invoice, SubscriptionStatus } from '@prisma/client'
import { InvoicesRepository } from '@/repositories/invoices-repository'

interface CreateInvoiceUseCaseRequest {
  userId: string
  planId: string
  status: SubscriptionStatus
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
  price: number
  currency?: string
  startedAt?: Date
  cardLast4?: string | null
  cardBrand?: string | null
}

interface CreateInvoiceUseCaseResponse {
  invoice: Invoice
}

export class CreateInvoiceUseCase {
  constructor(private invoicesRepository: InvoicesRepository) {}

  async execute({
    userId,
    planId,
    status,
    stripeSubscriptionId,
    stripePriceId,
    price,
    currency = 'BRL',
    startedAt,
    cardLast4,
    cardBrand,
  }: CreateInvoiceUseCaseRequest): Promise<CreateInvoiceUseCaseResponse> {
    const invoice = await this.invoicesRepository.create({
      userId,
      planId,
      status,
      stripeSubscriptionId,
      stripePriceId,
      price,
      currency,
      startedAt,
      cardLast4,
      cardBrand,
    })

    return { invoice }
  }
}
