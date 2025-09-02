// TESTE UNITARIO DE CADASTRO (não vai para BD)

import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryCompanysRepository } from '@/repositories/im-memory/in-memory-companys-repository'

import { CreateCompanyUseCase } from '../create-company'
import { CompanyAlreadyExistsError } from '../errors/company-already-exists-error'

let companysRepository: InMemoryCompanysRepository
let sut: CreateCompanyUseCase

describe('Create Company Use Case', () => {
  // Before garante que cada teste nao ser totalmente zerado sem reaproveitar nada do teste anterior
  beforeEach(() => {
    companysRepository = new InMemoryCompanysRepository()
    sut = new CreateCompanyUseCase(companysRepository)
  })
  it('Deve se cadastrar a company', async () => {
    const { company } = await sut.execute({
      name: 'Company Tech',
      cnpj: '18632932000112',
      phone: '31988223344',
      email: 'user@google.com',
      city: 'Cel. Fabriciano',
      state: 'MG',
      country: 'BRASIL',
      manager: '132',
    })

    expect(company.id).toEqual(expect.any(String))
  })

  it('CNPJ não pode ser repedito', async () => {
    const cnpj = '18632932000002'

    await sut.execute({
      name: 'Company Tech',
      cnpj,
      phone: '31988223344',
      email: 'user@google.com',
      city: 'Cel. Fabriciano',
      state: 'MG',
      country: 'BRASIL',
      manager: '132',
    })

    await expect(() =>
      sut.execute({
        name: 'Company Tech',
        cnpj,
        phone: '31988223344',
        email: 'user@google.com',
        city: 'Cel. Fabriciano',
        state: 'MG',
        country: 'BRASIL',
        manager: '132',
      }),
    ).rejects.toBeInstanceOf(CompanyAlreadyExistsError)
  })
})
