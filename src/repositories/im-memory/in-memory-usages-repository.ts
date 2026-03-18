import { Prisma, Usage, UsageMetric } from '@prisma/client'

import { UsagesRepository } from '../usages-repository'

export class InMemoryUsagesRepository implements UsagesRepository {
  public items: Usage[] = []

  async findManyByUserId(userId: string, period: Date) {
    return this.items.filter((item) => {
      const itemPeriod = new Date(item.period)
      return (
        item.userId === userId &&
        itemPeriod.getUTCFullYear() === period.getUTCFullYear() &&
        itemPeriod.getUTCMonth() === period.getUTCMonth()
      )
    })
  }

  async findByUserIdAndMetric(
    userId: string,
    metric: UsageMetric,
    period: Date,
  ) {
    const usage = this.items.find((item) => {
      // Comparar ano e mês para simplificar na memória
      const itemPeriod = new Date(item.period)
      return (
        item.userId === userId &&
        item.metric === metric &&
        itemPeriod.getUTCFullYear() === period.getUTCFullYear() &&
        itemPeriod.getUTCMonth() === period.getUTCMonth()
      )
    })

    if (!usage) {
      return null
    }

    return usage
  }

  async create(data: Prisma.UsageUncheckedCreateInput) {
    const usage = {
      id: Math.random().toString(),
      userId: data.userId,
      metric: data.metric,
      value: data.value ?? 0,
      period: new Date(data.period),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(usage)

    return usage
  }

  async increment(id: string, amount = 1) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items[index].value += amount
      this.items[index].updatedAt = new Date()
      return this.items[index]
    }

    throw new Error('Usage not found')
  }

  async decrement(id: string, amount = 1) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items[index].value = Math.max(0, this.items[index].value - amount)
      this.items[index].updatedAt = new Date()
      return this.items[index]
    }

    throw new Error('Usage not found')
  }

  async setValue(id: string, value: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items[index].value = Math.max(0, value)
      this.items[index].updatedAt = new Date()
      return this.items[index]
    }

    throw new Error('Usage not found')
  }
}
