import { UsageMetric } from '@prisma/client'
import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'

import { UpdateUsageUseCase } from '../usages/update-usage'

let usagesRepository: InMemoryUsagesRepository
let sut: UpdateUsageUseCase

describe('Update Usage Use Case', () => {
  beforeEach(() => {
    usagesRepository = new InMemoryUsagesRepository()
    sut = new UpdateUsageUseCase(usagesRepository)
  })

  it('deve ser possível atualizar o valor de um uso (forçar valor por um ADMIN)', async () => {
    const now = new Date()
    const period = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )

    await usagesRepository.create({
      userId: 'user-01',
      metric: UsageMetric.COMPANIES,
      period,
      value: 5,
    })

    const { usage } = await sut.execute({
      userId: 'user-01',
      metric: UsageMetric.COMPANIES,
      value: 2, // Admin corrigindo erro e reduzindo uso pra 2
    })

    expect(usage.value).toEqual(2)
  })

  it('deve criar o uso se não existir para atualizar', async () => {
    const { usage } = await sut.execute({
      userId: 'user-01',
      metric: UsageMetric.INVOICES,
      value: 10,
    })

    expect(usage.id).toEqual(expect.any(String))
    expect(usage.value).toEqual(10)
  })
})
