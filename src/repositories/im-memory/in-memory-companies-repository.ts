import { randomUUID } from 'node:crypto'

import { Company, Prisma, Status } from '@prisma/client'

import { CompaniesRepository } from '../companies-repository'

export class InMemoryCompaniesRepository implements CompaniesRepository {
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
      .filter((item) => item.managerId === userId)
      .slice((page - 1) * 20, page * 20)
  }

  async searchMany(query: string, page: number) {
    return this.items
      .filter((item) => item.name.includes(query) || (item.cnpj && item.cnpj.includes(query)))
      .slice((page - 1) * 20, page * 20)
  }

  async findMany(page: number) {
    return this.items.slice((page - 1) * 20, page * 20)
  }

  async update(data: Prisma.CompanyUncheckedUpdateInput) {
    const companyIndex = this.items.findIndex((item) => item.id === data.id)

    if (companyIndex >= 0) {
      if (data.name !== undefined) this.items[companyIndex].name = data.name as string
      if (data.cnpj !== undefined) this.items[companyIndex].cnpj = data.cnpj as string | null
      if (data.email !== undefined) this.items[companyIndex].email = data.email as string | null
      if (data.phone !== undefined) this.items[companyIndex].phone = data.phone as string | null
      if (data.country !== undefined) this.items[companyIndex].country = data.country as string | null
      if (data.city !== undefined) this.items[companyIndex].city = data.city as string | null
      if (data.state !== undefined) this.items[companyIndex].state = data.state as string | null
      if (data.address !== undefined) this.items[companyIndex].address = data.address as string | null
      if (data.number !== undefined) this.items[companyIndex].number = data.number as string | null
      if (data.complement !== undefined) this.items[companyIndex].complement = data.complement as string | null
      if (data.cep !== undefined) this.items[companyIndex].cep = data.cep as string | null
      if (data.active !== undefined) this.items[companyIndex].active = data.active as boolean
      if (data.status !== undefined) this.items[companyIndex].status = data.status as Status
      if (data.managerId !== undefined) this.items[companyIndex].managerId = data.managerId as string
      if (data.lastAccess !== undefined) this.items[companyIndex].lastAccess = data.lastAccess as Date | null
    }

    return this.items[companyIndex]
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
      managerId: data.managerId,
      lastAccess: null,
    }

    this.items.push(company)

    return company
  }

  async updateStatusByManagerId(
    managerId: string,
    fromStatus: Status | Status[],
    toStatus: Status,
  ): Promise<string[]> {
    const statusArray = Array.isArray(fromStatus) ? fromStatus : [fromStatus]

    const updatedIds: string[] = []

    this.items = this.items.map((item) => {
      if (item.managerId === managerId && statusArray.includes(item.status)) {
        updatedIds.push(item.id)
        return { ...item, status: toStatus }
      }
      return item
    })

    return updatedIds
  }

  async findManyByManagerId(managerId: string) {
    return this.items
      .filter((item) => item.managerId === managerId)
      .sort((a, b) => {
        if (a.lastAccess === b.lastAccess) return 0
        if (a.lastAccess === null) return 1 // a (null) vai para o final
        if (b.lastAccess === null) return -1 // b (null) vai para o final
        return b.lastAccess.getTime() - a.lastAccess.getTime()
      })
  }
}

