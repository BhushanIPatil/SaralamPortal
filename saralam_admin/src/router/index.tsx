import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { JobsPage } from '@/pages/JobsPage'
import { ApplicationsPage } from '@/pages/ApplicationsPage'
import { SubscriptionsPage } from '@/pages/SubscriptionsPage'
import { OffersPage } from '@/pages/OffersPage'
import { RatingsPage } from '@/pages/RatingsPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { PlatformSettingsPage } from '@/pages/PlatformSettingsPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'applications', element: <ApplicationsPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'offers', element: <OffersPage /> },
      { path: 'ratings', element: <RatingsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <PlatformSettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
