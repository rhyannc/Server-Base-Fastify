import { Company, Prisma } from '@prisma/client'

export interface companysRepository {
  findById(id: string): Promise<Company | null>
  findByCnpj(cnpj?: string | null): Promise<Company | null>
  findManyByUserManager(userId: string, page: number): Promise<Company[]>
  searchMany(query: string, page: number): Promise<Company[]>
  create(data: Prisma.CompanyUncheckedCreateInput): Promise<Company>
}
