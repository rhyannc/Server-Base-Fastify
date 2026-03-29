import { Prisma } from '@prisma/client'

import { env } from '@/env'
import { prisma } from '@/lib/prisma'

import { CollaboratorsRepository } from '../collaborators-repository'

export class PrismaCollaboratorsRepository implements CollaboratorsRepository {
  async findById(id: string) {
    const collaborator = await prisma.collaborator.findUnique({
      where: {
        id,
      },
    })
    return collaborator
  }

  async findByCompanyAndUser(companyId: string, userId: string) {
    const collaborator = await prisma.collaborator.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
    })
    return collaborator
  }

  async findManyByCompany(companyId: string, page: number) {
    const collaborators = await prisma.collaborator.findMany({
      where: {
        companyId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      take: env.TAKE_PAGINATION,
      skip: (page - 1) * env.TAKE_PAGINATION,
    })
    return collaborators
  }

  async findManyByUser(userId: string, page: number) {
    const collaborators = await prisma.collaborator.findMany({
      where: {
        userId,
      },
      include: {
        company: {
          select: {
            name: true,
            cnpj: true,
          },
        },
      },
      take: env.TAKE_PAGINATION,
      skip: (page - 1) * env.TAKE_PAGINATION,
    })
    return collaborators
  }

  async create(data: Prisma.CollaboratorUncheckedCreateInput) {
    const collaborator = await prisma.collaborator.create({
      data,
    })
    return collaborator
  }

  async update(data: Prisma.CollaboratorUncheckedUpdateInput) {
    const collaborator = await prisma.collaborator.update({
      where: {
        id: data.id as string,
      },
      data,
    })
    return collaborator
  }

  async delete(id: string) {
    await prisma.collaborator.delete({
      where: {
        id,
      },
    })
  }
}
