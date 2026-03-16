import { Company, Prisma } from '@prisma/client'

export interface CompanysRepository {
  findById(id: string): Promise<Company | null>
  findByCnpj(cnpj?: string | null): Promise<Company | null>
  findMany(page: number): Promise<any[]>
  findManyByUserManager(userId: string, page: number): Promise<Company[]>
  searchMany(query: string, page: number): Promise<any[]>
  create(data: Prisma.CompanyUncheckedCreateInput): Promise<Company>
  update(data: Prisma.CompanyUncheckedUpdateInput): Promise<Company>
}
