import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { CompanysRepository } from '../companys-repository'

export class PrismaCompanysRepository implements CompanysRepository {
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
      take: 20, // Total de resutados por pagina
      skip: (page - 1) * 20,
    })
    return companies
  }

  async findManyByUserManager(userId: string, page: number) {
    const companies = await prisma.company.findMany({
      where: {
        manager: userId,
      },
      take: 20, // Total de resutados por pagina
      skip: (page - 1) * 20,
    })
    return companies
  }

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

  /* async searchMany(query: string, page: number) {
    const company = await prisma.company.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      take: 20,
      skip: (page - 1) * 20,
    })
  } */

  async create(data: Prisma.CompanyUncheckedCreateInput) {
    const company = await prisma.company.create({
      data,
    })

    return company
  }
}
