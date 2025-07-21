import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin istifadəçisi - güclü şifrə
  const adminPassword = 'AdminREA2024!@#'
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12) // Increased salt rounds for security
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@reainvest.az' },
    update: {},
    create: {
      email: 'admin@reainvest.az',
      fullName: 'Admin İstifadəçi',
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  // Agent istifadəçisi - güclü şifrə
  const agentPassword = 'AgentREA2024$%^'
  const hashedAgentPassword = await bcrypt.hash(agentPassword, 12)
  
  const agent = await prisma.user.upsert({
    where: { email: 'agent@reainvest.az' },
    update: {},
    create: {
      email: 'agent@reainvest.az',
      fullName: 'Agent İstifadəçi',
      password: hashedAgentPassword,
      role: UserRole.AGENT,
      isActive: true,
    },
  })

  console.log('Test istifadəçiləri yaradıldı:', { admin, agent })
  
  // Development məlumatları
  console.log('\n🔐 Test giriş məlumatları:')
  console.log('👨‍💼 Admin:', {
    email: 'admin@reainvest.az',
    password: adminPassword,
    role: 'ADMIN'
  })
  console.log('👤 Agent:', {
    email: 'agent@reainvest.az', 
    password: agentPassword,
    role: 'AGENT'
  })
  console.log('\n⚠️  Bu şifrələri production mühitində dəyişdirin!\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })