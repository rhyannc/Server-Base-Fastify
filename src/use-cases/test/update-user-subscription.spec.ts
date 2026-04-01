import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryCollaboratorsRepository } from '@/repositories/im-memory/in-memory-collaborators-repository'
import { InMemoryCompaniesRepository } from '@/repositories/im-memory/in-memory-companies-repository'
import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'
import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'

import { PlanNotActiveError } from '../errors/plan-not-active-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UpdateUserSubscriptionUseCase } from '../subscriptions/update-user-subscription'

let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let usersRepository: InMemoryUsersRepository
let plansRepository: InMemoryPlansRepository
let companiesRepository: InMemoryCompaniesRepository
let collaboratorsRepository: InMemoryCollaboratorsRepository
let usagesRepository: InMemoryUsagesRepository
let sut: UpdateUserSubscriptionUseCase

describe('Update User Subscription Use Case', () => {
  beforeEach(() => {
    userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
    usersRepository = new InMemoryUsersRepository()
    plansRepository = new InMemoryPlansRepository()
    companiesRepository = new InMemoryCompaniesRepository()
    collaboratorsRepository = new InMemoryCollaboratorsRepository(companiesRepository)
    usagesRepository = new InMemoryUsagesRepository()
    sut = new UpdateUserSubscriptionUseCase(
      userSubscriptionsRepository,
      plansRepository,
      companiesRepository,
      collaboratorsRepository,
      usagesRepository,
    )
  })

  it('deve ser possível atualizar uma assinatura (planId e status)', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    const initialPlan = await plansRepository.create({
      name: 'Basic',
      price: 50,
      maxCompanies: '1',
      maxCollaborators: '5',
      maxInvoices: '100',
    })

    const newPlan = await plansRepository.create({
      name: 'Pro',
      price: 100,
      maxCompanies: 10,
      maxCollaborators: 50,
      maxInvoices: 1000,
    })

    await userSubscriptionsRepository.create({
      userId: user.id,
      planId: initialPlan.id,
      status: 'TRIALING',
    })

    const { userSubscription } = await sut.execute({
      userId: user.id,
      planId: newPlan.id,
      status: 'ACTIVE',
    })

    expect(userSubscription.planId).toEqual(newPlan.id)
    expect(userSubscription.status).toEqual('ACTIVE')
  })

  it('não deve ser possível atualizar se não houver assinatura', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        status: 'ACTIVE',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('não deve ser possível atualizar para um plano inexistente', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    const initialPlan = await plansRepository.create({
      name: 'Basic',
      price: 50,
      maxCompanies: '1',
      maxCollaborators: '5',
      maxInvoices: '100',
    })

    await userSubscriptionsRepository.create({
      userId: user.id,
      planId: initialPlan.id,
      status: 'TRIALING',
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        planId: 9999, // Inexistente
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('não deve ser possível atualizar para um plano inativo', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    const initialPlan = await plansRepository.create({
      name: 'Basic',
      price: 50,
      maxCompanies: '1',
      maxCollaborators: '5',
      maxInvoices: '100',
    })

    const inactivePlan = await plansRepository.create({
      name: 'Legacy',
      price: 30,
      isActive: false,
      maxCompanies: 1,
      maxCollaborators: 5,
      maxInvoices: 100,
    })

    await userSubscriptionsRepository.create({
      userId: user.id,
      planId: initialPlan.id,
      status: 'TRIALING',
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        planId: inactivePlan.id,
      }),
    ).rejects.toBeInstanceOf(PlanNotActiveError)
  })

  it('deve arquivar empresas e colaboradores excedentes no downgrade de plano', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    const initialPlan = await plansRepository.create({
      name: 'Unlimited',
      price: 500,
      maxCompanies: 10,
      maxCollaborators: 100,
      maxInvoices: '1000',
    })

    const newPlan = await plansRepository.create({
      name: 'Limited',
      price: 50,
      maxCompanies: 1,
      maxCollaborators: 1,
      maxInvoices: 100,
    })

    // Cria assinatura inicial
    await userSubscriptionsRepository.create({
      userId: user.id,
      planId: initialPlan.id,
      status: 'ACTIVE',
    })

    // Cria 2 empresas
    const company1 = await companiesRepository.create({
      name: 'Company 1',
      managerId: user.id,
    })
    const company2 = await companiesRepository.create({
      name: 'Company 2',
      managerId: user.id,
    })

    // Define lastAccess (Company 2 é a mais recente)
    company1.lastAccess = new Date('2026-01-01')
    company2.lastAccess = new Date('2026-03-01')

    // Cria colaboradores para ambas
    await collaboratorsRepository.create({
      companyId: company1.id,
      userId: 'user-1',
    })
    await collaboratorsRepository.create({
      companyId: company2.id,
      userId: 'user-2',
    })
    // Colaborador extra para a company 2 exceder o limite de 1 do novo plano
    await collaboratorsRepository.create({
      companyId: company2.id,
      userId: 'user-3',
    })

    // Executa Downgrade
    await sut.execute({
      userId: user.id,
      planId: newPlan.id,
    })

    // Verifica se a Company 1 foi arquivada (mais antiga)
    expect(companiesRepository.items.find(c => c.id === company1.id)?.status).toEqual('ARCHIVED')
    // Verifica se a Company 2 continuou ativa (mais recente)
    expect(companiesRepository.items.find(c => c.id === company2.id)?.status).toEqual('ACTIVE')

    // Verifica colaboradores da Company 1 (devem ser arquivados junto com a empresa)
    const colabs1 = collaboratorsRepository.items.filter(c => c.companyId === company1.id)
    expect(colabs1[0].status).toEqual('ARCHIVED')

    // Verifica colaboradores da Company 2 (um deve ser arquivado para respeitar maxCollaborators: 1)
    const colabs2 = collaboratorsRepository.items.filter(c => c.companyId === company2.id)
    const activeColabs2 = colabs2.filter(c => c.status === 'ACTIVE')
    expect(activeColabs2.length).toEqual(1)

    // Verifica Sincronização de Usage
    const currentPeriod = new Date()
    currentPeriod.setDate(1)
    currentPeriod.setHours(0, 0, 0, 0)

    const companyUsage = await usagesRepository.findByUserIdAndMetric(user.id, 'COMPANIES', currentPeriod)
    expect(companyUsage?.value).toEqual(1)

    const collaboratorUsage = await usagesRepository.findByUserIdAndMetric(user.id, 'COLLABORATORS', currentPeriod)
    expect(collaboratorUsage?.value).toEqual(1)
  })

  it('deve arquivar primeiro as empresas com lastAccess nulo no downgrade', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    const newPlan = await plansRepository.create({
      name: 'Limited',
      price: 50,
      maxCompanies: 1,
      maxCollaborators: 10,
      maxInvoices: 100,
    })

    await userSubscriptionsRepository.create({
      userId: user.id,
      planId: newPlan.id,
      status: 'ACTIVE',
    })

    // Empresa com acesso antigo
    const companyOld = await companiesRepository.create({
      name: 'Old Access',
      managerId: user.id,
    })
    companyOld.lastAccess = new Date('2026-01-01')

    // Empresa com acesso nulo (nunca acessada)
    const companyNull = await companiesRepository.create({
      name: 'Never Accessed',
      managerId: user.id,
    })
    companyNull.lastAccess = null

    // Empresa com acesso recente
    const companyRecent = await companiesRepository.create({
      name: 'Recent Access',
      managerId: user.id,
    })
    companyRecent.lastAccess = new Date('2026-03-29')

    // Executa Downgrade para Limite 1
    await sut.execute({
      userId: user.id,
      planId: newPlan.id,
    })

    // Deve manter apenas a RECENTE
    expect(companiesRepository.items.find(c => c.id === companyRecent.id)?.status).toEqual('ACTIVE')
    // Deve arquivar a OLD e a NULL
    expect(companiesRepository.items.find(c => c.id === companyOld.id)?.status).toEqual('ARCHIVED')
    expect(companiesRepository.items.find(c => c.id === companyNull.id)?.status).toEqual('ARCHIVED')
  })
})
