import { UsageMetric } from '@prisma/client'
import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'

import { FetchUserUsagesUseCase } from '../fetch-user-usages'

let usagesRepository: InMemoryUsagesRepository
let sut: FetchUserUsagesUseCase

describe('Fetch User Usages Use Case', () => {
  beforeEach(() => {
    usagesRepository = new InMemoryUsagesRepository()
    sut = new FetchUserUsagesUseCase(usagesRepository)
  })

  it('deve ser possível buscar os usos do usuário no mês corrente', async () => {
    const now = new Date()
    const period = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )

    await usagesRepository.create({
      userId: 'user-01',
      metric: UsageMetric.COMPANIES,
      period,
      value: 1,
    })

    await usagesRepository.create({
      userId: 'user-01',
      metric: UsageMetric.COLLABORATORS,
      period,
      value: 5,
    })

    const { usages } = await sut.execute({
      userId: 'user-01',
    })

    expect(usages).toHaveLength(2)
    expect(usages).toEqual([
      expect.objectContaining({ metric: 'COMPANIES' }),
      expect.objectContaining({ metric: 'COLLABORATORS' }),
    ])
  })
})
