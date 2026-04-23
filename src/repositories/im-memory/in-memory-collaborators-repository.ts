import { randomUUID } from 'node:crypto'

import { Collaborator, Prisma, Status } from '@prisma/client'

import { CollaboratorsRepository } from '../collaborators-repository'
import { InMemoryCompaniesRepository } from './in-memory-companies-repository'
import { InMemoryUsersRepository } from './in-memory-users-repository'

export class InMemoryCollaboratorsRepository implements CollaboratorsRepository {
  public items: Collaborator[] = []

  constructor(
    private companiesRepository: InMemoryCompaniesRepository = new InMemoryCompaniesRepository(),
    private usersRepository: InMemoryUsersRepository = new InMemoryUsersRepository(),
  ) {}

  async findById(id: string) {
    const collaborator = this.items.find((item) => item.id === id)

    if (!collaborator) {
      return null
    }

    return collaborator
  }

  async findByCompanyAndUser(companyId: string, userId: string) {
    const collaborator = this.items.find(
      (item) => item.companyId === companyId && item.userId === userId,
    )

    if (!collaborator) {
      return null
    }

    return collaborator
  }

  async findManyByCompany(companyId: string, page: number) {
    return this.items
      .filter((item) => item.companyId === companyId)
      .slice((page - 1) * 20, page * 20)
  }

  async findManyByUser(userId: string, page: number) {
    return this.items
      .filter((item) => item.userId === userId)
      .slice((page - 1) * 20, page * 20)
  }

  async create(data: Prisma.CollaboratorUncheckedCreateInput) {
    const collaborator: Collaborator = {
      id: randomUUID(),
      companyId: data.companyId,
      userId: data.userId,
      role: data.role ?? 'COLLABORATOR',
      status: data.status ?? Status.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(collaborator)

    return collaborator
  }

  async update(data: Prisma.CollaboratorUncheckedUpdateInput) {
    const collaboratorIndex = this.items.findIndex(
      (item) => item.id === data.id,
    )

    if (collaboratorIndex >= 0) {
      if (data.role !== undefined) this.items[collaboratorIndex].role = data.role as any
      if (data.status !== undefined) this.items[collaboratorIndex].status = data.status as Status
      this.items[collaboratorIndex].updatedAt = new Date()
    }

    return this.items[collaboratorIndex]
  }

  async delete(id: string) {
    const collaboratorIndex = this.items.findIndex((item) => item.id === id)

    if (collaboratorIndex >= 0) {
      this.items.splice(collaboratorIndex, 1)
    }
  }

  async updateStatusByCompanyIds(
    companyIds: string[],
    fromStatus: Status | Status[],
    toStatus: Status,
  ): Promise<void> {
    const statusArray = Array.isArray(fromStatus) ? fromStatus : [fromStatus]

    this.items = this.items.map((item) => {
      if (
        companyIds.includes(item.companyId) &&
        statusArray.includes(item.status)
      ) {
        return { ...item, status: toStatus }
      }
      return item
    })
  }

  async findManyByManagerId(managerId: string) {
    const managerCompanies = this.companiesRepository.items.filter(
      (company) => company.managerId === managerId,
    )
    const companyIds = managerCompanies.map((c) => c.id)

    return this.items
      .filter((item) => companyIds.includes(item.companyId))
      .map((item) => {
        const user = this.usersRepository.items.find((u) => u.id === item.userId)
        return { ...item, user: { lastLoginAt: user?.lastLoginAt ?? null } }
      })
      .sort((a, b) => {
        if (a.user.lastLoginAt === b.user.lastLoginAt) return 0
        if (a.user.lastLoginAt === null) return 1
        if (b.user.lastLoginAt === null) return -1
        return b.user.lastLoginAt.getTime() - a.user.lastLoginAt.getTime()
      })
  }

  async countActiveByManagerId(managerId: string) {
    const managerCompanies = this.companiesRepository.items.filter(
      (company) => company.managerId === managerId,
    )
    const companyIds = managerCompanies.map((c) => c.id)

    return this.items.filter(
      (item) => companyIds.includes(item.companyId) && item.status === 'ACTIVE',
    ).length
  }

  async findByCompanyId(companyId: string) {
    return this.items.filter((item) => item.companyId === companyId)
  }
}

