import { PrismaCompanysRepository } from '@/repositories/prisma/prisma-companys-respository'

import { CreateCompanyUseCase } from '../create-company'

export function makeCreateCompanyUseCase() {
  const prismaCompanysRepository = new PrismaCompanysRepository()
  const createCompanyUseCase = new CreateCompanyUseCase(
    prismaCompanysRepository,
  )

  return createCompanyUseCase
}
