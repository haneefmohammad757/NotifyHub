import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import NavItem from '../components/NavItem';
import { IconHome, IconDiscover, IconCalendar, IconQueries } from '../components/Icons';
import NotificationDropdown from '../components/NotificationDropdown';
import './StudentLayout.css';

const studentNavItems = [
  { to: '/student', label: 'Home', icon: <IconHome />, end: true },
  { to: '/student/discover', label: 'Discover', icon: <IconDiscover /> },
  { to: '/student/calendar', label: 'Calendar', icon: <IconCalendar /> },
  { to: '/student/queries', label: 'Queries', icon: <IconQueries /> },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="student-layout">
      <header className="student-header" role="banner">
        <div className="student-header__inner">
          <div className="student-header__left">
            <Logo to="/student" />
            <nav className="student-nav-desktop" aria-label="Student navigation">
              {studentNavItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </nav>
          </div>
          <div className="student-header__right">
            <NotificationDropdown />
            <div className="student-user-badge">
              <span className="student-avatar">
                {user?.role === 'ADMIN' ? 'B' : (user?.name ? user.name.charAt(0).toUpperCase() : 'S')}
              </span>
              <span className="student-user-name">
                {user?.role === 'ADMIN' ? (user?.name && user.name !== 'Admin User' ? user.name : 'Balaji Lanka') : (user?.name || 'Student')}
              </span>
            </div>
            <button className="student-logout-btn" onClick={logout} title="Log out">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="student-main" id="main-content">
        <Outlet />
      </main>

      <nav className="student-nav-mobile" aria-label="Student navigation">
        {studentNavItems.map((item) => (
          <NavItem key={item.to} {...item} variant="bottom" />
        ))}
      </nav>
    </div>
  );
}
