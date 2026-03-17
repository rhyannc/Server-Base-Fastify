import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryCollaboratorsRepository } from '@/repositories/im-memory/in-memory-collaborators-repository'
import { InMemoryCompaniesRepository } from '@/repositories/im-memory/in-memory-companies-repository'
import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'

import { CreateCollaboratorUseCase } from '../create-collaborator'
import { CollaboratorAlreadyExistsError } from '../errors/collaborator-already-exists-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

let collaboratorsRepository: InMemoryCollaboratorsRepository
let companiesRepository: InMemoryCompaniesRepository
let usersRepository: InMemoryUsersRepository
let sut: CreateCollaboratorUseCase

describe('Create Collaborator Use Case', () => {
  beforeEach(() => {
    collaboratorsRepository = new InMemoryCollaboratorsRepository()
    companiesRepository = new InMemoryCompaniesRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new CreateCollaboratorUseCase(
      collaboratorsRepository,
      companiesRepository,
      usersRepository,
    )
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
      managerId: user.id,
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
