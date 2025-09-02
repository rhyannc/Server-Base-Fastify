// TESTE UNITARIO DE CADASTRO (não vai para BD)
import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'

import { AuthenticateUseCase } from '../authenticate'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'

let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase
describe('Authenticate Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })
  it('Deve se Autenticar', async () => {
    await usersRepository.create({
      name: 'Jaco',
      email: 'jaco@google.com.br',
      password_hash: await hash('123456', 4),
    })

    const { user } = await sut.execute({
      email: 'jaco@google.com.br',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('Não Pode Autenticar com email errado', async () => {
    await expect(() =>
      sut.execute({
        email: 'manolo@google.com.br',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('Não Pode Autenticar com PassWord errado', async () => {
    await usersRepository.create({
      name: 'Jaco',
      email: 'jaco@google.com.br',
      password_hash: await hash('123456', 4),
    })

    await expect(() =>
      sut.execute({
        email: 'jaco@google.com.br',
        password: '12345',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
