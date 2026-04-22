import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryCollaboratorsRepository } from '@/repositories/im-memory/in-memory-collaborators-repository'
import { InMemoryCompaniesRepository } from '@/repositories/im-memory/in-memory-companies-repository'
import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'

import { SubscriptionCanceledUseCase } from '../gateways/stripe/subscription-canceled'

let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let companiesRepository: InMemoryCompaniesRepository
let collaboratorsRepository: InMemoryCollaboratorsRepository
let usagesRepository: InMemoryUsagesRepository
let sut: SubscriptionCanceledUseCase

describe('Subscription Canceled Use Case', () => {
  beforeEach(() => {
    userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
    companiesRepository = new InMemoryCompaniesRepository()
    collaboratorsRepository = new InMemoryCollaboratorsRepository()
    usagesRepository = new InMemoryUsagesRepository()
    sut = new SubscriptionCanceledUseCase(
      userSubscriptionsRepository,
      companiesRepository,
      collaboratorsRepository,
      usagesRepository,
    )
  })

  it('deve ser possível cancelar uma assinatura e arquivar empresas ACTIVE e FROZEN', async () => {
    // 1. Setup - Criar assinatura
    const subscription = await userSubscriptionsRepository.create({
      userId: 'user-01',
      planId: 1,
      status: 'ACTIVE',
    })

    // 2. Setup - Criar empresas (uma ACTIVE e uma FROZEN)
    const companyActive = await companiesRepository.create({
      name: 'Active Co',
      cnpj: '123',
      managerId: 'user-01',
      status: 'ACTIVE',
    })

    const companyFrozen = await companiesRepository.create({
      name: 'Frozen Co',
      cnpj: '456',
      managerId: 'user-01',
      status: 'FROZEN',
    })

    // 3. Setup - Criar colaboradores para essas empresas
    await collaboratorsRepository.create({
      companyId: companyActive.id,
      userId: 'collab-01',
      status: 'ACTIVE',
    })

    await collaboratorsRepository.create({
      companyId: companyFrozen.id,
      userId: 'collab-02',
      status: 'FROZEN',
    })

    // 4. Executar cancelamento
    await sut.execute({
      userId: 'user-01',
    })

    // 5. Verificações
    const updatedSubscription = await userSubscriptionsRepository.findByUserId('user-01')
    expect(updatedSubscription?.status).toBe('CANCELED')
    expect(updatedSubscription?.canceledAt).toBeInstanceOf(Date)

    const updatedCompanyActive = await companiesRepository.findById(companyActive.id)
    const updatedCompanyFrozen = await companiesRepository.findById(companyFrozen.id)
    
    expect(updatedCompanyActive?.status).toBe('ARCHIVED')
    expect(updatedCompanyFrozen?.status).toBe('ARCHIVED')

    // Verificar colaboradores via repository (InMemory precisará suportar o filtro de status que eu adicionei)
    // Nota: Como eu mudei a interface do repository, preciso garantir que o InMemory tb suporte.
  })
})
