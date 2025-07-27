import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/middleware/ProtectedRoute';
import SignUpPage from '@/pages/SignUpPage';
import LoginPage from '@/pages/SignInPage';
import { Role } from '@/types/user.types';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import Layout from '@/components/layout/Layout';
import PageNotFound from '@/pages/special/PageNotFound';
import UnauthorizedPage from '@/pages/special/UnauthorizedPage';
import { useAuth } from '@/hooks';
import AdminSetupPage from '@/pages/AdminSetupPage';
import DhDashboard from '@/features/dh-dashboard/components/DhDashboard';
import TestPage from '@/pages/TestPage';
import { ComponentListPage, ComponentDetailsPage } from '@/features/component-model/pages';

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/sign-in" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/admin-setup" element={<AdminSetupPage />} />

      <Route element={<Layout />}>
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dh-dashboard"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN]}>
              <DhDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/test"
          element={
            <TestPage />
          }
        />
        <Route
          path="/components"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN]}>
              <ComponentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/components/:id"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DESIGNER, Role.OTHER]}>
              <ComponentDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>

    </Routes>
  );
};

export default AppRouter;
