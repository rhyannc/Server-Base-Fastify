import { Prisma, Token } from '@prisma/client'
import { TokensRepository } from '../tokens-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryTokensRepository implements TokensRepository {
  public items: Token[] = []

  async create(data: Prisma.TokenUncheckedCreateInput): Promise<Token> {
    const token = {
      id: randomUUID(),
      token: data.token || randomUUID(),
      type: data.type,
      userId: data.userId,
      createdAt: new Date(),
      expiresAt: new Date(data.expiresAt),
    }

    this.items.push(token as Token)

    return token as Token
  }

  async findByToken(token: string): Promise<Token | null> {
    const found = this.items.find((item) => item.token === token)
    return found || null
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id)
    if (index !== -1) {
      this.items.splice(index, 1)
    }
  }
}
