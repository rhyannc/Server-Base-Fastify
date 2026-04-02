import { Prisma, Token } from '@prisma/client'

export interface TokensRepository {
  create(data: Prisma.TokenUncheckedCreateInput): Promise<Token>
  findByToken(token: string): Promise<Token | null>
  delete(id: string): Promise<void>
}
