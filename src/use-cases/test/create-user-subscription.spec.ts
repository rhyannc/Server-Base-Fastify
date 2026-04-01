import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'
import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'

import { CreateUserSubscriptionUseCase } from '../subscriptions/create-user-subscription'
import { PlanNotActiveError } from '../errors/plan-not-active-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UserSubscriptionAlreadyExistsError } from '../errors/user-subscription-already-exists-error'

let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let usersRepository: InMemoryUsersRepository
let plansRepository: InMemoryPlansRepository
let sut: CreateUserSubscriptionUseCase

describe('Create User Subscription Use Case', () => {
  beforeEach(() => {
    userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
    usersRepository = new InMemoryUsersRepository()
    plansRepository = new InMemoryPlansRepository()
    sut = new CreateUserSubscriptionUseCase(
      userSubscriptionsRepository,
      usersRepository,
      plansRepository,
    )
  })

  it('deve ser possível criar uma assinatura para um usuário', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    const plan = await plansRepository.create({
      name: 'Pro',
      price: 100,
      maxCompanies: '10',
      maxCollaborators: '50',
      maxInvoices: '1000',
    })

    const { userSubscription } = await sut.execute({
      userId: user.id,
      planId: plan.id as number,
    })

    expect(userSubscription.id).toEqual(expect.any(String))
    expect(userSubscription.status).toEqual('ACTIVE')
  })

  it('não deve ser possível assinar um plano inativo', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    const plan = await plansRepository.create({
      name: 'Legacy',
      price: 50,
      isActive: false,
      maxCompanies: '10',
      maxCollaborators: '50',
      maxInvoices: '1000',
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        planId: plan.id,
      }),
    ).rejects.toBeInstanceOf(PlanNotActiveError)
  })

  it('não deve ser possível assinar se o usuário já possui assinatura', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    const plan = await plansRepository.create({
      name: 'Pro',
      price: 100,
      maxCompanies: '10',
      maxCollaborators: '50',
      maxInvoices: '1000',
    })

    await sut.execute({
      userId: user.id,
      planId: plan.id as number,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        planId: plan.id,
      }),
    ).rejects.toBeInstanceOf(UserSubscriptionAlreadyExistsError)
  })

  it('não deve ser possível assinar com usuário inexistente', async () => {
    const plan = await plansRepository.create({
      name: 'Pro',
      price: 100,
      maxCompanies: '10',
      maxCollaborators: '50',
      maxInvoices: '1000',
    })

    await expect(() =>
      sut.execute({
        userId: 'non-existing-user',
        planId: plan.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('não deve ser possível assinar plano inexistente', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: '123456',
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        planId: 9999,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
