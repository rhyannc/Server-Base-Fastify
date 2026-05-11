import { Prisma } from '@prisma/client'

import { env } from '@/env'
import { prisma } from '@/lib/prisma'

import { PlansRepository } from '../plans-repository'

export class PrismaPlansRepository implements PlansRepository {
  async findById(id: string) {
    const plans = await prisma.plan.findUnique({
      where: {
        id,
      },
    })
    return plans
  }

  async findByStripePriceId(stripePriceId: string) {
    const plan = await prisma.plan.findFirst({
      where: {
        stripePriceId,
      },
    })
    return plan
  }

  async findMany(page: number, onlyActive = true): Promise<[any[], number]> {
    const where = onlyActive ? { isActive: true } : {}
    const transaction = await prisma.$transaction([
      prisma.plan.findMany({
        take: env.TAKE_PAGINATION,
        skip: (page - 1) * env.TAKE_PAGINATION,
        where,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.plan.count({ where }),
    ])
    return transaction
  }

  async searchMany(query: string, page: number): Promise<[any[], number]> {
    const where = {
      name: {
        contains: query,
        mode: 'insensitive' as Prisma.QueryMode,
      },
    }
    const transaction = await prisma.$transaction([
      prisma.plan.findMany({
        where,
        take: env.TAKE_PAGINATION,
        skip: (page - 1) * env.TAKE_PAGINATION,
      }),
      prisma.plan.count({ where }),
    ])
    return transaction
  }

  async create(data: Prisma.PlanCreateInput) {
    const plan = await prisma.plan.create({ data })
    return plan
  }

  async update(data: Prisma.PlanUncheckedUpdateInput) {
    const plan = await prisma.plan.update({
      where: {
        id: data.id as string, // O Prisma precisa saber QUAL ID atualizar
      },
      data, // Os dados novos
    })
    return plan
  }
}
