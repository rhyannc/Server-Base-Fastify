import { randomUUID } from 'node:crypto'

import { Company, Prisma } from '@prisma/client'

import { companysRepository } from '../companys-repository'

export class InMemoryCompanysRepository implements companysRepository {
  public items: Company[] = []

  async findById(id: string) {
    const company = this.items.find((item) => item.id === id)

    if (!company) {
      return null
    }

    return company
  }

  async findByCnpj(cnpj: string) {
    const company = this.items.find((item) => item.cnpj === cnpj)

    if (!company) {
      return null
    }

    return company
  }

  async create(data: Prisma.CompanyUncheckedCreateInput) {
    const company = {
      id: randomUUID(),
      name: data.name,
      cnpj: data.cnpj ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      country: 'BR',
      city: data.city ?? null,
      state: data.state ?? null,
      address: data.address ?? null,
      number: data.number ?? null,
      complement: data.complement ?? null,
      cep: data.cep ?? null,
      active: true,
      createdBy: 'user-0',
      createdAt: new Date(),
      updatedBy: 'user',
      updatedAt: new Date(),
      manager: '123',
    }

    this.items.push(company)

    return company
  }
}
