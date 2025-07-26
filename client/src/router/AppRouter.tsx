import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/middleware/ProtectedRoute';
import SignUpPage from '@/pages/SignUpPage';
import LoginPage from '@/pages/SignInPage';
import { Role } from '@/types/user.types';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import Layout from '@/components/layout/Layout';
import PageNotFound from '@/pages/special/PageNotFound';
import UnauthorizedPage from '@/pages/special/UnauthorizedPage';

const AppRouter = () => {
  // const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignUpPage />} />

      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} /> */}
    </Routes>
  );
};

export default AppRouter;
