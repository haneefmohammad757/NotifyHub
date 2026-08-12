import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';

import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFound from '../pages/NotFound';
import StudentHome from '../pages/StudentHome';
import StudentDiscover from '../pages/StudentDiscover';
import StudentCalendar from '../pages/StudentCalendar';
import AdminOverview from '../pages/AdminOverview';
import AdminAnnouncements from '../pages/AdminAnnouncements';
import AdminEvents from '../pages/AdminEvents';
import AdminQueries from '../pages/AdminQueries';
import AdminActivity from '../pages/AdminActivity';
import StudentQueries from '../pages/StudentQueries';
import AnnouncementDetail from '../pages/AnnouncementDetail';

/**
 * Root wrapper that provides AuthContext to the entire routing tree.
 */
function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      /* --- Public Landing Page --- */
      {
        index: true,
        element: <LandingPage />,
      },
      /* --- Public Auth Routes --- */
      {
        path: 'login',
        element: <LoginPage isAdmin={false} />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'admin/login',
        element: <LoginPage isAdmin={true} />,
      },

      /* --- Student Protected Routes --- */
      {
        path: 'student',
        element: (
          <ProtectedRoute role="STUDENT">
            <StudentLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <StudentHome /> },
          {
            path: 'discover',
            element: <StudentDiscover />,
          },
          {
            path: 'calendar',
            element: <StudentCalendar />,
          },
          {
            path: 'queries',
            element: <StudentQueries />,
          },
          {
            path: 'detail',
            element: <AnnouncementDetail />,
          },
        ],
      },

      /* --- Admin Protected Routes --- */
      {
        path: 'admin',
        element: (
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminOverview /> },
          {
            path: 'announcements',
            element: <AdminAnnouncements />,
          },
          {
            path: 'events',
            element: <AdminEvents />,
          },
          {
            path: 'queries',
            element: <AdminQueries />,
          },
          {
            path: 'activity',
            element: <AdminActivity />,
          },
          {
            path: 'settings',
            element: <Navigate to="/admin" replace />,
          },
        ],
      },

      /* --- 404 Catch-all --- */
      {
        path: '*',
        element: <NotFound />,
      },
    ]
  }
]);

export default router;
