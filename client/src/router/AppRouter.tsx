import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/middleware/ProtectedRoute';
import SignUpPage from '@/pages/SignUpPage';
import LoginPage from '@/pages/SignInPage';
import { Role } from '@/types/user.types';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import Layout from '@/components/layout/Layout';

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />



      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles={[Role.ADMIN, Role.DESIGNER]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>



      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default AppRouter;
