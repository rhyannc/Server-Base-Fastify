import { Collaborator, Prisma, Status } from '@prisma/client'

export interface CollaboratorsRepository {
  findById(id: string): Promise<Collaborator | null>
  findByCompanyAndUser(
    companyId: string,
    userId: string,
  ): Promise<Collaborator | null>
  findManyByCompany(companyId: string, page: number): Promise<Collaborator[]>
  findManyByUser(userId: string, page: number): Promise<Collaborator[]>
  create(data: Prisma.CollaboratorUncheckedCreateInput): Promise<Collaborator>
  update(data: Prisma.CollaboratorUncheckedUpdateInput): Promise<Collaborator>
  delete(id: string): Promise<void>
  updateStatusByCompanyIds(
    companyIds: string[],
    fromStatus: Status | Status[],
    toStatus: Status,
  ): Promise<void>

  findManyByManagerId(managerId: string): Promise<Collaborator[]>
  countActiveByManagerId(managerId: string): Promise<number>
}

