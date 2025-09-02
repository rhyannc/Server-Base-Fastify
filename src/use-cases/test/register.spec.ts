// TESTE UNITARIO DE CADASTRO (não vai para BD)
import { compare } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'

import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { RegisterUseCase } from '../register'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  // Before garante que cada teste nao ser totalmente zerado sem reaproveitar nada do teste anterior
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })
  it('Deve se cadastrar', async () => {
    const { user } = await sut.execute({
      name: 'User Test',
      email: 'user@google.com',
      password: '123456',
      plan: 'Gold',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('A senha deve ser um Hash ao cadastrar', async () => {
    const { user } = await sut.execute({
      name: 'User Test',
      email: 'user@google.com',
      phone: '31988223344',
      password: '123456',
      plan: 'Gold',
    })

    // Utiliza o Bcrypt para verificar se essa senha pode se transformar no Hash
    const isPasswordCorrectlyHashed = await compare(
      '123456',
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('Email não pode ser repedito', async () => {
    const email = 'user@google.com'

    await sut.execute({
      name: 'User Test',
      email,
      phone: '31988223344',
      password: '123456',
      plan: 'Gold',
    })

    await expect(() =>
      sut.execute({
        name: 'User Test',
        email,
        phone: '31988223344',
        password: '123456',
        plan: 'Gold',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
