import { PrismaInvoicesRepository } from '@/repositories/prisma/prisma-invoices-repository'
import { CreateInvoiceUseCase } from '../subscriptions/create-invoice'

export function makeCreateInvoiceUseCase() {
  const invoicesRepository = new PrismaInvoicesRepository()
  const useCase = new CreateInvoiceUseCase(invoicesRepository)

  return useCase
}
