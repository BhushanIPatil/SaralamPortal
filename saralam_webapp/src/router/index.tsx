import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

import { LandingPage } from '@/pages/public/LandingPage'
import { BrowseServicesPage } from '@/pages/public/BrowseServicesPage'
import { BrowseJobsPage } from '@/pages/public/BrowseJobsPage'
import { ServiceDetailPage } from '@/pages/public/ServiceDetailPage'
import { CategoryPage } from '@/pages/public/CategoryPage'
import { CategoriesListPage } from '@/pages/public/CategoriesListPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { PricingPage } from '@/pages/public/PricingPage'
import { PrivacyPage } from '@/pages/public/PrivacyPage'
import { TermsPage } from '@/pages/public/TermsPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { SeekerDashboardPage } from '@/pages/seeker/DashboardPage'
import { PostJobPage } from '@/pages/seeker/PostJobPage'
import { MyJobsPage } from '@/pages/seeker/MyJobsPage'
import { JobApplicationsPage } from '@/pages/seeker/JobApplicationsPage'
import { EditJobPage } from '@/pages/seeker/EditJobPage'
import { ShortlistPage } from '@/pages/seeker/ShortlistPage'
import { ProviderDashboardPage } from '@/pages/provider/DashboardPage'
import { MyServicesPage } from '@/pages/provider/MyServicesPage'
import { CreateServicePage } from '@/pages/provider/CreateServicePage'
import { ProviderBrowseJobsPage } from '@/pages/provider/BrowseJobsPage'
import { MyApplicationsPage } from '@/pages/provider/MyApplicationsPage'
import { EarningsPage } from '@/pages/provider/EarningsPage'
import { SearchPage } from '@/pages/public/SearchPage'
import { ProfilePage } from '@/pages/shared/ProfilePage'
import { NotificationsPage } from '@/pages/shared/NotificationsPage'
import { SubscriptionPage } from '@/pages/shared/SubscriptionPage'
import { SettingsPage } from '@/pages/shared/SettingsPage'

function RedirectIfLoggedIn({
  children,
  toSeeker,
  toProvider,
}: {
  children: React.ReactNode
  toSeeker: string
  toProvider: string
}) {
  const { accessToken, user } = useAuthStore()
  if (accessToken && user) {
    const path = user.role === 'provider' ? toProvider : toSeeker
    return <Navigate to={path} replace />
  }
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'services', element: <BrowseServicesPage /> },
      { path: 'services/:id', element: <ServiceDetailPage /> },
      { path: 'jobs', element: <BrowseJobsPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'categories', element: <CategoriesListPage /> },
      { path: 'categories/:slug', element: <CategoryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'users/:id/public', element: <ProfilePage /> },
      {
        path: 'login',
        element: (
          <RedirectIfLoggedIn toSeeker="/seeker/dashboard" toProvider="/provider/dashboard">
            <LoginPage />
          </RedirectIfLoggedIn>
        ),
      },
      {
        path: 'register',
        element: (
          <RedirectIfLoggedIn toSeeker="/seeker/dashboard" toProvider="/provider/dashboard">
            <RegisterPage />
          </RedirectIfLoggedIn>
        ),
      },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'subscription',
        element: (
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'seeker',
        element: (
          <RoleRoute allowedRoles={['seeker']}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          { path: 'dashboard', element: <SeekerDashboardPage /> },
          { path: 'post-job', element: <PostJobPage /> },
          { path: 'jobs', element: <MyJobsPage /> },
          { path: 'jobs/:id/edit', element: <EditJobPage /> },
          { path: 'jobs/:id/applications', element: <JobApplicationsPage /> },
          { path: 'shortlist', element: <ShortlistPage /> },
        ],
      },
      {
        path: 'provider',
        element: (
          <RoleRoute allowedRoles={['provider']}>
            <Outlet />
          </RoleRoute>
        ),
        children: [
          { path: 'dashboard', element: <ProviderDashboardPage /> },
          { path: 'services', element: <MyServicesPage /> },
          { path: 'services/new', element: <CreateServicePage /> },
          { path: 'services/:id/edit', element: <CreateServicePage /> },
          { path: 'jobs', element: <ProviderBrowseJobsPage /> },
          { path: 'applications', element: <MyApplicationsPage /> },
          { path: 'earnings', element: <EarningsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
