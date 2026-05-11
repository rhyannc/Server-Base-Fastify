import { Plan, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { randomUUID } from 'node:crypto'

import { PlansRepository } from '../plans-repository'

export class InMemoryPlansRepository implements PlansRepository {
  public items: Plan[] = []

  async findById(id: string) {
    const plan = this.items.find((item) => item.id === id)

    if (!plan) {
      return null
    }

    return plan
  }

  async findByStripePriceId(stripePriceId: string) {
    const plan = this.items.find((item) => item.stripePriceId === stripePriceId)

    if (!plan) {
      return null
    }

    return plan
  }

  async findMany(page: number, onlyActive = true): Promise<[Plan[], number]> {
    let items = this.items
    if (onlyActive) {
      items = items.filter((item) => item.isActive)
    }
    const paginated = items.slice((page - 1) * 20, page * 20)
    return [paginated, items.length]
  }

  async searchMany(query: string, page: number): Promise<[Plan[], number]> {
    const filtered = this.items.filter((item) => item.name.includes(query))
    const paginated = filtered.slice((page - 1) * 20, page * 20)
    return [paginated, filtered.length]
  }

  async create(data: Prisma.PlanCreateInput) {
    const plan = {
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
      isPopular: data.isPopular ?? false,
      price: new Decimal(data.price.toString()),
      maxCompanies: data.maxCompanies ?? null,
      maxCollaborators: data.maxCollaborators ?? null,
      maxInvoices: data.maxInvoices ?? null,
      stripeProductId: data.stripeProductId ?? null,
      stripePriceId: data.stripePriceId ?? null,
      createdAt: new Date(),
    }

    this.items.push(plan)

    return plan
  }

  async update(data: Prisma.PlanUncheckedUpdateInput) {
    const index = this.items.findIndex((item) => item.id === data.id)

    if (index >= 0) {
      this.items[index] = { ...this.items[index], ...data } as any
    }

    return this.items[index]
  }
}
