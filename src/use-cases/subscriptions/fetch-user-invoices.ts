import { InvoicesRepository, InvoiceWithPlan } from '@/repositories/invoices-repository'

interface FetchUserInvoicesUseCaseRequest {
  userId: string
  limit?: number
}

interface FetchUserInvoicesUseCaseResponse {
  invoices: InvoiceWithPlan[]
}

export class FetchUserInvoicesUseCase {
  constructor(private invoicesRepository: InvoicesRepository) {}

  async execute({
    userId,
    limit = 12,
  }: FetchUserInvoicesUseCaseRequest): Promise<FetchUserInvoicesUseCaseResponse> {
    const invoices = await this.invoicesRepository.findManyByUserId(userId, limit)

    return { invoices }
  }
}
