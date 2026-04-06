import { PrismaInvoicesRepository } from '@/repositories/prisma/prisma-invoices-repository'
import { FetchUserInvoicesUseCase } from '../subscriptions/fetch-user-invoices'

export function makeFetchUserInvoicesUseCase() {
  const invoicesRepository = new PrismaInvoicesRepository()
  const useCase = new FetchUserInvoicesUseCase(invoicesRepository)

  return useCase
}
