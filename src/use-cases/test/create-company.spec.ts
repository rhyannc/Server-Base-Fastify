// TESTE UNITARIO DE CADASTRO (não vai para BD)

import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryCompaniesRepository } from '@/repositories/im-memory/in-memory-companies-repository'
import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'

import { CheckAndIncrementUsageUseCase } from '../usages/check-and-increment-usage'
import { CreateCompanyUseCase } from '../companies/create-company'
import { CompanyAlreadyExistsError } from '../errors/company-already-exists-error'

let companiesRepository: InMemoryCompaniesRepository
let usagesRepository: InMemoryUsagesRepository
let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let plansRepository: InMemoryPlansRepository
let checkAndIncrementUsageUseCase: CheckAndIncrementUsageUseCase
let sut: CreateCompanyUseCase

describe('Create Company Use Case', () => {
  // Before garante que cada teste nao ser totalmente zerado sem reaproveitar nada do teste anterior
  beforeEach(async () => {
    companiesRepository = new InMemoryCompaniesRepository()
    usagesRepository = new InMemoryUsagesRepository()
    userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
    plansRepository = new InMemoryPlansRepository()
    
    checkAndIncrementUsageUseCase = new CheckAndIncrementUsageUseCase(
      usagesRepository,
      userSubscriptionsRepository,
      plansRepository,
    )

    sut = new CreateCompanyUseCase(
      companiesRepository,
      checkAndIncrementUsageUseCase,
    )

    const plan = await plansRepository.create({
      name: 'Pro',
      price: 100,
      maxCompanies: 10,
      maxCollaborators: 50,
      maxInvoices: 1000,
    })

    await userSubscriptionsRepository.create({
      userId: '132',
      planId: plan.id as number,
      status: 'ACTIVE',
    })
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
      managerId: '132',
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
      managerId: '132',
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
        managerId: '132',
      }),
    ).rejects.toBeInstanceOf(CompanyAlreadyExistsError)
  })
})
