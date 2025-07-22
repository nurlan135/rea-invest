import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Providers } from '@/components/providers'
import { AutoLogoutProvider } from '@/components/auth/auto-logout-provider'
import { NavigationDebug } from '@/components/debug/navigation-debug'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Sabit timeout dəyərləri hydration uyğunsuzluğunu önləmək üçün
  const TIMEOUT_MINUTES = 480 // 8 saat
  const WARNING_MINUTES = 5

  return (
    <Providers>
      <AutoLogoutProvider timeoutMinutes={TIMEOUT_MINUTES} warningMinutes={WARNING_MINUTES}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex">
            <div className="hidden md:block w-64">
              <Sidebar />
            </div>
            <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
              {children}
            </main>
          </div>
          {/* NavigationDebug hydration xətasına səbəb olduğu üçün söndürüldü */}
          {/* <NavigationDebug /> */}
        </div>
      </AutoLogoutProvider>
    </Providers>
  )
}