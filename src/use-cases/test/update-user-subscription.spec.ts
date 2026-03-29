import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'
import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'

import { PlanNotActiveError } from '../errors/plan-not-active-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UpdateUserSubscriptionUseCase } from '../update-user-subscription'

let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let usersRepository: InMemoryUsersRepository
let plansRepository: InMemoryPlansRepository
let sut: UpdateUserSubscriptionUseCase

describe('Update User Subscription Use Case', () => {
  beforeEach(() => {
    userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
    usersRepository = new InMemoryUsersRepository()
    plansRepository = new InMemoryPlansRepository()
    sut = new UpdateUserSubscriptionUseCase(
      userSubscriptionsRepository,
      plansRepository,
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
      maxCompanies: '10',
      maxCollaborators: '50',
      maxInvoices: '1000',
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
        planId: inactivePlan.id,
      }),
    ).rejects.toBeInstanceOf(PlanNotActiveError)
  })
})
