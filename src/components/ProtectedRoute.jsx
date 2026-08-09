import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute — guards routes based on authentication and role.
 * - If not authenticated → redirects to the appropriate login page.
 * - If authenticated but wrong role → redirects to their home.
 * - If loading → shows nothing (prevents flash of login page).
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    const loginPath = role === 'ADMIN' ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace />;
  }

  if (role && user.role !== role) {
    // Allow ADMIN to access STUDENT routes
    if (user.role === 'ADMIN' && role === 'STUDENT') {
      return children;
    }
    const homePath = user.role === 'ADMIN' ? '/admin' : '/student';
    return <Navigate to={homePath} replace />;
  }

  return children;
}
