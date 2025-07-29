import { Routes, Route } from 'react-router-dom';
// import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/middleware/ProtectedRoute';
import SignUpPage from '@/pages/SignUpPage';
import LoginPage from '@/pages/SignInPage';
import { Role } from '@/types/user.types';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import Layout from '@/components/layout/Layout';
import PageNotFound from '@/pages/special/PageNotFound';
import UnauthorizedPage from '@/pages/special/UnauthorizedPage';
// import { useAuth } from '@/hooks';
import AdminSetupPage from '@/pages/AdminSetupPage';
import DhDashboard from '@/features/dh-dashboard/components/DhDashboard';
import { ComponentDetailsPage, ComponentListPage } from '@/features/component-model/pages';
import HomePage from '@/pages/HomePage';
import NotificationsPage from '@/pages/NotificationsPage';
import { ProfilePage, PreferencesPage } from '@/features/user-profile';

const AppRouter = () => {
  // const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/sign-in" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/admin-setup" element={<AdminSetupPage />} />

      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DESIGNER, Role.OTHER, Role.DEPARTMENT_HEAD]}>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DESIGNER, Role.OTHER, Role.DEPARTMENT_HEAD]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

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
            <ProtectedRoute requiredRoles={[Role.DEPARTMENT_HEAD]}>
              <DhDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/components"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DESIGNER, Role.OTHER, Role.DEPARTMENT_HEAD]}>
              <ComponentListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/components/:id"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DESIGNER, Role.OTHER, Role.DEPARTMENT_HEAD]}>
              <ComponentDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DESIGNER, Role.OTHER, Role.DEPARTMENT_HEAD]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preferences"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DESIGNER, Role.OTHER, Role.DEPARTMENT_HEAD]}>
              <PreferencesPage />
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
