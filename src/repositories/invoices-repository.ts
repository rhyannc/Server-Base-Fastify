import { Invoice, Plan, Prisma } from '@prisma/client'

export interface InvoiceWithPlan extends Invoice {
  plan: Plan
}

export interface InvoicesRepository {
  create(data: Prisma.InvoiceUncheckedCreateInput): Promise<Invoice>
  findManyByUserId(userId: string, limit?: number): Promise<InvoiceWithPlan[]>
}
