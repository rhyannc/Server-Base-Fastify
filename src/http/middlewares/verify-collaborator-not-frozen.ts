// Middleware que verifica se o usuário possui algum registro de colaborador com status FROZEN.
// Se houver, bloqueia o acesso às rotas de companies.

import { FastifyReply, FastifyRequest } from 'fastify'

import { prisma } from '@/lib/prisma'

export async function verifyCollaboratorNotFrozen(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user

  const frozenCollaborator = await prisma.collaborator.findFirst({
    where: {
      userId: sub,
      status: 'FROZEN',
    },
    select: { id: true },
  })

  if (frozenCollaborator) {
    return reply.status(403).send({
      message:
        'Seu acesso está suspenso. Entre em contato com o responsável.',
    })
  }
}
