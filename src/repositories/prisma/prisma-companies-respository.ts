import { Prisma } from '@prisma/client'

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

  async findMany(page: number) {
    const companies = await prisma.company.findMany({
      include: {
        manager: {
          select: {
            name: true,
          },
        },
      },
      take: 20, // Total de resutados por pagina
      skip: (page - 1) * 20,
    })
    return companies
  }

  async findManyByUserManager(userId: string, page: number) {
    const companies = await prisma.company.findMany({
      where: {
        managerId: userId,
      },
      take: 20, // Total de resutados por pagina
      skip: (page - 1) * 20,
    })
    return companies
  }

  async searchMany(query: string, page: number) {
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive', // VAI PESQUISAR INDEPENDENTE SE ESTA MAIUSCULO OU MINUSCULO
            },
          },
          {
            cnpj: {
              contains: query,
            },
          },
        ],
      },
      include: {
        manager: {
          select: {
            name: true,
          },
        },
      },

      take: 20, // Total de resutados por pagina
      skip: (page - 1) * 20,
    })
    return companies
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
}
