import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryCompaniesRepository } from '@/repositories/im-memory/in-memory-companies-repository'

import { CompanyNotActiveError } from '../errors/company-not-active-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { SelectCompanyUseCase } from '../select-company'

let companiesRepository: InMemoryCompaniesRepository
let sut: SelectCompanyUseCase

describe('Select Company Use Case', () => {
  beforeEach(() => {
    companiesRepository = new InMemoryCompaniesRepository()
    sut = new SelectCompanyUseCase(companiesRepository)
  })

  it('should be able to select an active company', async () => {
    const company = await companiesRepository.create({
      name: 'Acme Corp',
      managerId: 'manager-1',
    })

    const { company: selectedCompany } = await sut.execute({
      companyId: company.id,
    })

    expect(selectedCompany.id).toEqual(company.id)
    expect(selectedCompany.lastAccess).toBeInstanceOf(Date)
  })

  it('should not be able to select a non-existing company', async () => {
    await expect(() =>
      sut.execute({
        companyId: 'non-existing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to select a non-active company', async () => {
    const company = await companiesRepository.create({
      name: 'Acme Corp',
      managerId: 'manager-1',
    })

    // Alterar status manualmente para ARCHIVED
    companiesRepository.items[0].status = 'ARCHIVED'

    await expect(() =>
      sut.execute({
        companyId: company.id,
      }),
    ).rejects.toBeInstanceOf(CompanyNotActiveError)
  })
})
