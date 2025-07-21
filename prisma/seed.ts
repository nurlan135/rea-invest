import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin istifadəçisi
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@reainvest.az' },
    update: {},
    create: {
      email: 'admin@reainvest.az',
      fullName: 'Admin İstifadəçi',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  // Agent istifadəçisi
  const agentPassword = await bcrypt.hash('agent123', 10)
  
  const agent = await prisma.user.upsert({
    where: { email: 'agent@reainvest.az' },
    update: {},
    create: {
      email: 'agent@reainvest.az',
      fullName: 'Agent İstifadəçi',
      password: agentPassword,
      role: UserRole.AGENT,
      isActive: true,
    },
  })

  console.log('Test istifadəçiləri yaradıldı:', { admin, agent })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })