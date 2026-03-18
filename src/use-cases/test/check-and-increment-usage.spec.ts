import { UsageMetric } from '@prisma/client'
import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'

import { CheckAndIncrementUsageUseCase } from '../check-and-increment-usage'
import { PlanLimitReachedError } from '../errors/plan-limit-reached-error'

let usagesRepository: InMemoryUsagesRepository
let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let plansRepository: InMemoryPlansRepository
let sut: CheckAndIncrementUsageUseCase

describe('Check and Increment Usage Use Case', () => {
  beforeEach(() => {
    usagesRepository = new InMemoryUsagesRepository()
    userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
    plansRepository = new InMemoryPlansRepository()
    sut = new CheckAndIncrementUsageUseCase(
      usagesRepository,
      userSubscriptionsRepository,
      plansRepository,
    )
  })

  it('deve ser possível incrementar o uso se estiver dentro do limite do plano', async () => {
    const plan = await plansRepository.create({
      name: 'Basic',
      price: 50,
      maxCompanies: 2,
      maxCollaborators: 5,
      maxInvoices: 100,
    })

    await userSubscriptionsRepository.create({
      userId: 'user-1',
      planId: plan.id as number,
      status: 'ACTIVE',
    })

    const { usage } = await sut.execute({
      userId: 'user-1',
      metric: UsageMetric.COMPANIES,
    })

    expect(usage.id).toEqual(expect.any(String))
    expect(usage.value).toEqual(1)
  })

  it('não deve ser possível incrementar o uso contínuo se exceder o limite do plano', async () => {
    const plan = await plansRepository.create({
      name: 'Basic',
      price: 50,
      maxCompanies: 1, // Limite de apenas 1 empresa
      maxCollaborators: 5,
      maxInvoices: 100,
    })

    await userSubscriptionsRepository.create({
      userId: 'user-1',
      planId: plan.id as number,
      status: 'ACTIVE',
    })

    // Primeiro uso (Permitido)
    await sut.execute({
      userId: 'user-1',
      metric: UsageMetric.COMPANIES,
    })

    // Segundo uso (Não permitido, limite alcançado)
    await expect(() =>
      sut.execute({
        userId: 'user-1',
        metric: UsageMetric.COMPANIES,
      }),
    ).rejects.toBeInstanceOf(PlanLimitReachedError)
  })
})
