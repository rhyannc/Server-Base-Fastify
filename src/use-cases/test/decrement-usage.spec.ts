import { UsageMetric } from '@prisma/client'
import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'

import { DecrementUsageUseCase } from '../usages/decrement-usage'

let usagesRepository: InMemoryUsagesRepository
let sut: DecrementUsageUseCase

describe('Decrement Usage Use Case', () => {
  beforeEach(() => {
    usagesRepository = new InMemoryUsagesRepository()
    sut = new DecrementUsageUseCase(usagesRepository)
  })

  it('deve ser possível decrementar um uso existente', async () => {
    const now = new Date()
    const period = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )

    await usagesRepository.create({
      userId: 'user-1',
      metric: UsageMetric.COMPANIES,
      period,
      value: 2,
    })

    const { usage: updatedUsage } = await sut.execute({
      userId: 'user-1',
      metric: UsageMetric.COMPANIES,
    })

    expect(updatedUsage?.value).toEqual(1)
  })

  it('não deve decrementar valores abaixo de 0', async () => {
    const now = new Date()
    const period = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )

    await usagesRepository.create({
      userId: 'user-1',
      metric: UsageMetric.COMPANIES,
      period,
      value: 0,
    })

    const { usage: updatedUsage } = await sut.execute({
      userId: 'user-1',
      metric: UsageMetric.COMPANIES,
    })

    expect(updatedUsage?.value).toEqual(0)
  })
})
