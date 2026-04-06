import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { InvoicesRepository } from '../invoices-repository'

export class PrismaInvoicesRepository implements InvoicesRepository {
  async create(data: Prisma.InvoiceUncheckedCreateInput) {
    const invoice = await prisma.invoice.create({
      data,
    })

    return invoice
  }

  async findManyByUserId(userId: string, limit?: number) {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        plan: true,
      },
    })

    return invoices
  }
}
