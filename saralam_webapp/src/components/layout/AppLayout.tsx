import { Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNotifications } from '@/hooks/useNotifications'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { SeekerBottomNav } from './SeekerBottomNav'
import { Toast } from '@/components/ui/Toast'
import { Onboarding } from '@/components/features/auth/Onboarding'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  useNotifications()
  const isLoggedIn = !!user
  const isSeekerRoute = location.pathname.startsWith('/seeker')
  const showSeekerBottomNav = user?.role === 'seeker' && isSeekerRoute

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {isLoggedIn && <MobileNav />}
      <div className="flex flex-1">
        {isLoggedIn && <Sidebar />}
        <main className={cn('flex-1 overflow-auto', showSeekerBottomNav && 'pb-16')}>
          <Outlet />
        </main>
      </div>
      <Footer />
      {showSeekerBottomNav && <SeekerBottomNav />}
      <Toast />
      <Onboarding />
    </div>
  )
}
