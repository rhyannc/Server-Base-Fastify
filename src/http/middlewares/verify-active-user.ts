import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'

export async function verifyActiveUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user

  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { active: true },
  })

  if (!user || !user.active) {
    return reply.status(403).send({
      message: 'Sua conta está desativada. Entre em contato com o suporte.',
    })
  }
}
