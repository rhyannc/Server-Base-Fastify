import { Prisma, Status } from '@prisma/client'

import { env } from '@/env'
import { prisma } from '@/lib/prisma'

import { CompaniesRepository } from '../companies-repository'

export class PrismaCompaniesRepository implements CompaniesRepository {
  async findById(id: string) {
    const company = await prisma.company.findUnique({
      where: {
        id,
      },
    })
    return company
  }

  async findByCnpj(cnpj: string) {
    const company = await prisma.company.findUnique({
      where: {
        cnpj,
      },
    })
    return company
  }

  async findMany(page: number): Promise<[any[], number]> {
    const transaction = await prisma.$transaction([
      prisma.company.findMany({
        include: {
          manager: {
            select: {
              name: true,
            },
          },
        },
        take: env.TAKE_PAGINATION, // Total de resutados por pagina
        skip: (page - 1) * env.TAKE_PAGINATION,
      }),
      prisma.company.count(),
    ])

    return transaction
  }

  async findManyByUserManager(userId: string, page: number): Promise<[any[], number]> {
    const transaction = await prisma.$transaction([
      prisma.company.findMany({
        where: {
          managerId: userId,
        },
        take: env.TAKE_PAGINATION, // Total de resutados por pagina
        skip: (page - 1) * env.TAKE_PAGINATION,
      }),
      prisma.company.count({
        where: {
          managerId: userId,
        },
      }),
    ])

    return transaction
  }

  async searchMany(query: string, page: number): Promise<[any[], number]> {
    const where = {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive' as Prisma.QueryMode, // VAI PESQUISAR INDEPENDENTE SE ESTA MAIUSCULO OU MINUSCULO
          },
        },
        {
          cnpj: {
            contains: query,
          },
        },
      ],
    }

    const transaction = await prisma.$transaction([
      prisma.company.findMany({
        where,
        include: {
          manager: {
            select: {
              name: true,
            },
          },
        },

        take: env.TAKE_PAGINATION, // Total de resutados por pagina
        skip: (page - 1) * env.TAKE_PAGINATION,
      }),
      prisma.company.count({ where }),
    ])

    return transaction
  }

  async create(data: Prisma.CompanyUncheckedCreateInput) {
    const company = await prisma.company.create({
      data,
    })

    return company
  }

  async update(data: Prisma.CompanyUncheckedUpdateInput) {
    const company = await prisma.company.update({
      where: {
        id: data.id as string, // O Prisma precisa saber QUAL ID atualizar
      },
      data, // Os dados novos
    })

    return company
  }

  async updateStatusByManagerId(
    managerId: string,
    fromStatus: Status | Status[],
    toStatus: Status,
  ): Promise<string[]> {
    const statusFilter = Array.isArray(fromStatus)
      ? { in: fromStatus }
      : fromStatus

    // Busca os IDs das empresas que serão atualizadas
    const companies = await prisma.company.findMany({
      where: { managerId, status: statusFilter },
      select: { id: true },
    })

    const companyIds = companies.map((c) => c.id)

    if (companyIds.length > 0) {
      await prisma.company.updateMany({
        where: { id: { in: companyIds } },
        data: { status: toStatus },
      })
    }

    return companyIds
  }

  async findManyByManagerId(managerId: string) {
    const companies = await prisma.company.findMany({
      where: { managerId },
      orderBy: { lastAccess: { sort: 'desc', nulls: 'last' } },
    })

    return companies
  }
}

