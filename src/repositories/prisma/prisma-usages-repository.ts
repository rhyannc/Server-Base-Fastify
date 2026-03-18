import { Prisma, UsageMetric } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { UsagesRepository } from '../usages-repository'

export class PrismaUsagesRepository implements UsagesRepository {
  async findManyByUserId(userId: string, period: Date) {
    const usages = await prisma.usage.findMany({
      where: {
        userId,
        period,
      },
    })
    return usages
  }

  async findByUserIdAndMetric(
    userId: string,
    metric: UsageMetric,
    period: Date,
  ) {
    const usage = await prisma.usage.findUnique({
      where: {
        userId_metric_period: {
          userId,
          metric,
          period,
        },
      },
    })

    return usage
  }

  async create(data: Prisma.UsageUncheckedCreateInput) {
    const usage = await prisma.usage.create({
      data,
    })

    return usage
  }

  async increment(id: string, amount = 1) {
    const usage = await prisma.usage.update({
      where: {
        id,
      },
      data: {
        value: {
          increment: amount,
        },
      },
    })

    return usage
  }

  async decrement(id: string, amount = 1) {
    const usage = await prisma.usage.update({
      where: {
        id,
      },
      data: {
        value: {
          decrement: amount,
        },
      },
    })

    return usage
  }

  async setValue(id: string, value: number) {
    const usage = await prisma.usage.update({
      where: {
        id,
      },
      data: {
        value,
      },
    })

    return usage
  }
}
