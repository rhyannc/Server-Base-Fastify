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

  async findMany(page: number, onlyActive = true) {
    const plans = await prisma.plan.findMany({
      take: env.TAKE_PAGINATION,// limita a quantidade de resultados por página
      skip: (page - 1) * env.TAKE_PAGINATION, // pula os resultados anteriores
      where:  onlyActive ? { isActive: true } : {},  
      orderBy: {
        name: 'asc',
      },
    })
    return plans
  }

  async searchMany(query: string, page: number) {
    const plans = await prisma.plan.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: env.TAKE_PAGINATION,
      skip: (page - 1) * env.TAKE_PAGINATION,
    })
    return plans
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
