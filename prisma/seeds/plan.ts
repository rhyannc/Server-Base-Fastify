import { PrismaClient, Prisma } from '@prisma/client'

export async function seedPlans(prisma: PrismaClient) {
  const plans = [
    {
      name: 'Plano Básico',
      description: 'Plano inicial para uso básico do sistema',
      features: [
        'Acesso ao sistema básico',
        'Suporte por e-mail (24h para resposta)',
        'API com limite de 100 chamadas diárias',
        'Cadastro de até 5 empresas',
      ],
      price: new Prisma.Decimal(9.9),
      maxCompanies: 2,
      maxCollaborators: 2,
      maxInvoices: 2,
      stripeProductId: 'prod_UHJAyc2Jn0aQCR',
      stripePriceId: 'price_1TIkYKAbPQYuBBlXJEC8eo1c',
      isActive: true,
      isPopular: false,
    },
    {
      name: 'Plano Pro',
      description: 'Plano intermediário com mais recursos e suporte',
      features: [
        'Todas as funcionalidades do Plano Pro',
        'Suporte 24/7 via chat e telefone',
        'Consultoria dedicada para implementação',
        'Cadastro ilimitado de empresas',
      ],
      price: new Prisma.Decimal(12.9),
      maxCompanies: 10,
      maxCollaborators: 10,
      maxInvoices: 10,
      stripeProductId: 'prod_UFMWJflzJ6kJca',
      stripePriceId: 'price_1TIkWvAbPQYuBBlXIZjKhgsK',
      isActive: true,
      isPopular: true,
    },
    {
      name: 'Plano Max',
      description: 'Plano avançado com API ilimitada e relatórios',
      features: [
        'Todas as funcionalidades do Plano Básico',
        'API ilimitada',
        'Relatórios avançados e dashboards',
        'Cadastro de até 50 empresas',
      ],
      price: new Prisma.Decimal(19.9),
      maxCompanies: 20,
      maxCollaborators: 20,
      maxInvoices: 20,
      stripeProductId: 'prod_UFMX7jG4WlbSDF',
      stripePriceId: 'price_1TGrogAbPQYuBBlXz2CuAAVH',
      isActive: true,
      isPopular: false,
    },
  ]

  for (const plan of plans) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: plan.name },
    })

    if (existingPlan) {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: plan,
      })
    } else {
      await prisma.plan.create({
        data: plan,
      })
    }
  }

  console.log('✅ Planos cadastrados com sucesso!')
}