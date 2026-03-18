import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryCollaboratorsRepository } from '@/repositories/im-memory/in-memory-collaborators-repository'
import { InMemoryCompaniesRepository } from '@/repositories/im-memory/in-memory-companies-repository'
import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'
import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'

import { CheckAndIncrementUsageUseCase } from '../check-and-increment-usage'
import { CreateCollaboratorUseCase } from '../create-collaborator'
import { CollaboratorAlreadyExistsError } from '../errors/collaborator-already-exists-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

let collaboratorsRepository: InMemoryCollaboratorsRepository
let companiesRepository: InMemoryCompaniesRepository
let usersRepository: InMemoryUsersRepository
let usagesRepository: InMemoryUsagesRepository
let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let plansRepository: InMemoryPlansRepository
let checkAndIncrementUsageUseCase: CheckAndIncrementUsageUseCase
let sut: CreateCollaboratorUseCase
let managerIdForTests: string

describe('Create Collaborator Use Case', () => {
  beforeEach(async () => {
    collaboratorsRepository = new InMemoryCollaboratorsRepository()
    companiesRepository = new InMemoryCompaniesRepository()
    usersRepository = new InMemoryUsersRepository()
    usagesRepository = new InMemoryUsagesRepository()
    userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
    plansRepository = new InMemoryPlansRepository()

    checkAndIncrementUsageUseCase = new CheckAndIncrementUsageUseCase(
      usagesRepository,
      userSubscriptionsRepository,
      plansRepository,
    )

    sut = new CreateCollaboratorUseCase(
      collaboratorsRepository,
      companiesRepository,
      usersRepository,
      checkAndIncrementUsageUseCase,
    )

    const plan = await plansRepository.create({
      name: 'Pro',
      price: 100,
      maxCompanies: 10,
      maxCollaborators: 50,
      maxInvoices: 1000,
    })

    // Setup de um usuário genérico que será manager das empresas
    const user = await usersRepository.create({
      name: 'Manager',
      email: 'manager@example.com',
      passwordHash: '123456',
    })
    managerIdForTests = user.id

    // Esse manager precisa de uma assinatura para os incrementos de limite funcionarem
    await userSubscriptionsRepository.create({
      userId: managerIdForTests,
      planId: plan.id as number,
      status: 'ACTIVE',
    })
  })

  it('deve ser possível cadastrar um colaborador', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      passwordHash: '123456',
    })

    const company = await companiesRepository.create({
      name: 'Acme Corp',
      cnpj: '11122233344455',
      managerId: managerIdForTests, // manager
    })

    const { collaborator } = await sut.execute({
      companyId: company.id,
      userId: user.id,
      authorId: user.id,
      authorRole: 'ADMIN',
    })

    expect(collaborator.id).toEqual(expect.any(String))
    expect(collaborator.role).toEqual('MEMBER')
  })

  it('não deve ser possível cadastrar o mesmo colaborador na mesma empresa duas vezes', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      passwordHash: '123456',
    })

    const company = await companiesRepository.create({
      name: 'Acme Corp',
      cnpj: '11122233344455',
      managerId: managerIdForTests, // manager
    })

    await sut.execute({
      companyId: company.id,
      userId: user.id,
      authorId: user.id,
      authorRole: 'ADMIN',
    })

    await expect(() =>
      sut.execute({
        companyId: company.id,
        userId: user.id,
        authorId: user.id,
        authorRole: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(CollaboratorAlreadyExistsError)
  })

  it('não deve ser possível cadastrar colaborador se empresa nao existe', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      passwordHash: '123456',
    })

    await expect(() =>
      sut.execute({
        companyId: 'non-existing-company-id',
        userId: user.id,
        authorId: user.id,
        authorRole: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('não deve ser possível cadastrar colaborador se usuário não existe', async () => {
    const company = await companiesRepository.create({
      name: 'Acme Corp',
      cnpj: '11122233344455',
      managerId: managerIdForTests, // manager
    })

    await expect(() =>
      sut.execute({
        companyId: company.id,
        userId: 'non-existing-user-id',
        authorId: 'any-id',
        authorRole: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
