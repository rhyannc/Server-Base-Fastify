// TESTE UNITARIO DE CADASTRO (não vai para BD)
import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'

import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { GetUserProfileUseCase } from '../get-user-profile'

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe('Get User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserProfileUseCase(usersRepository)
  })
  it('Deve se Buscar um usuario', async () => {
    const createdUser = await usersRepository.create({
      name: 'Jaco',
      email: 'jaco@google.com.br',
      passwordHash: await hash('123456', 4),
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('Não deve buscar um usuario com id invalido', async () => {
    await expect(() =>
      sut.execute({
        userId: 'sem-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
