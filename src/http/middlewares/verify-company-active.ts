// Middleware que verifica se a empresa está ativa (não FROZEN nem ARCHIVED)
// antes de permitir funcionalidades.
// Pode ser usado em rotas que recebam companyId no params, body ou query.

import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const companyIdSchema = z.object({
  companyId: z.string().uuid(),
})

export async function verifyCompanyActive(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Tenta encontrar o companyId em params, body ou query
  const parsed =
    companyIdSchema.safeParse(request.params) ||
    companyIdSchema.safeParse(request.body) ||
    companyIdSchema.safeParse(request.query)

  // Identifica qual objeto tem o formato correto
  const result = [
    companyIdSchema.safeParse(request.params),
    companyIdSchema.safeParse(request.body),
    companyIdSchema.safeParse(request.query),
  ].find((r) => r.success)

  if (!result || !result.success) {
    return reply.status(400).send({ message: 'companyId inválido ou ausente.' })
  }

  const { companyId } = result.data

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { status: true },
  })

  if (!company) {
    return reply.status(404).send({ message: 'Empresa não encontrada.' })
  }

  if (company.status === 'FROZEN' || company.status === 'ARCHIVED') {
    return reply.status(403).send({
      message:
        'Não é possível realizar ações em uma empresa suspensa ou arquivada.',
    })
  }
}

