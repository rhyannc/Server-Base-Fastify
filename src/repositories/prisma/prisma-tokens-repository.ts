import { prisma } from '@/lib/prisma'
import { Prisma, Token } from '@prisma/client'
import { TokensRepository } from '../tokens-repository'

export class PrismaTokensRepository implements TokensRepository {
  async create(data: Prisma.TokenUncheckedCreateInput): Promise<Token> {
    const token = await prisma.token.create({
      data,
    })
    return token
  }

  async findByToken(token: string): Promise<Token | null> {
    const foundToken = await prisma.token.findUnique({
      where: {
        token,
      },
    })
    return foundToken
  }

  async delete(id: string): Promise<void> {
    await prisma.token.delete({
      where: {
        id,
      },
    })
  }
}
