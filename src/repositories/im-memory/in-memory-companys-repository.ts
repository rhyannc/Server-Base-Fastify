import { randomUUID } from 'node:crypto'

import { Company, Prisma, Status } from '@prisma/client'

import { CompanysRepository } from '../companys-repository'

export class InMemoryCompanysRepository implements CompanysRepository {
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

  async findManyByUserManager(userId: string, page: number) {
    return this.items
      .filter((item) => item.name.includes(userId))
      .slice((page - 1) * 20, page * 20)
  }

  async searchMany(query: string, page: number) {
    return this.items
      .filter((item) => item.name.includes(query))
      .slice((page - 1) * 20, page * 20)
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
      status: data.status ?? Status.ACTIVE,
      createdBy: 'user-0',
      createdAt: new Date(),
      updatedBy: 'user',
      updatedAt: new Date(),
      managerId: '123',
    }

    this.items.push(company)

    return company
  }
}
