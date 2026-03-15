import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/services': 'Services',
  '/jobs': 'Jobs',
  '/applications': 'Applications',
  '/subscriptions': 'Subscriptions',
  '/offers': 'Offers',
  '/ratings': 'Ratings',
  '/analytics': 'Analytics',
  '/settings': 'Platform Settings',
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Admin'

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)]">
      <AdminSidebar />
      <div className="pl-60">
        <AdminHeader title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
