import { Company, Prisma, Status } from '@prisma/client'

export interface CompaniesRepository {
  findById(id: string): Promise<Company | null>
  findByCnpj(cnpj?: string | null): Promise<Company | null>
  findMany(page: number): Promise<any[]>
  findManyByUserManager(userId: string, page: number): Promise<Company[]>
  searchMany(query: string, page: number): Promise<any[]>
  create(data: Prisma.CompanyUncheckedCreateInput): Promise<Company>
  update(data: Prisma.CompanyUncheckedUpdateInput): Promise<Company>
  updateStatusByManagerId(
    managerId: string,
    fromStatus: Status | Status[],
    toStatus: Status,
  ): Promise<string[]> // retorna IDs das empresas atualizadas

  findManyByManagerId(managerId: string): Promise<Company[]>
}

