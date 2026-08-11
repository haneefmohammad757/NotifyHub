import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import NavItem from '../components/NavItem';
import { IconMenu, IconClose, IconOverview, IconAnnouncement, IconEvent, IconQueries, IconActivity } from '../components/Icons';
import './AdminLayout.css';

const adminNavItems = [
  { to: '/admin', label: 'Overview', icon: <IconOverview />, end: true },
  { to: '/admin/announcements', label: 'Announcements', icon: <IconAnnouncement /> },
  { to: '/admin/events', label: 'Events', icon: <IconEvent /> },
  { to: '/admin/queries', label: 'Queries', icon: <IconQueries /> },
  { to: '/admin/activity', label: 'Activity Log', icon: <IconActivity /> },
];

/** Map route paths to human-readable page titles for the topbar */
function getPageTitle(pathname) {
  const segment = pathname.replace('/admin', '').replace(/^\//, '') || 'overview';
  if (segment === 'activity') return 'Activity Log';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const adminName = user?.name ? user.name : 'ADMIN';
  const now = useCurrentTime();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const pageTitle = getPageTitle(location.pathname);
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="admin-layout admin-theme">
      {/* Mobile Header */}
      <header className="admin-mobile-header" role="banner">
        <Logo to="/admin" isAdmin={true} showTagline={false} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="admin-topbar__avatar">{adminName.charAt(0)}</div>
          <button
            className="admin-mobile-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay admin-sidebar-overlay--visible"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar__header">
          <Logo to="/admin" isAdmin={true} showTagline={true} />
        </div>

        <nav className="admin-sidebar__nav" onClick={closeSidebar}>
          <span className="admin-sidebar__section-label">Management</span>
          {adminNavItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          <button className="admin-logout-btn" onClick={logout}>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Body */}
      <div className="admin-body">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-topbar__left">
            <div className="admin-topbar__logo">
              <Logo to="/admin" isAdmin={true} showTagline={false} />
            </div>
            <div className="admin-topbar__breadcrumb">
              <span className="admin-topbar__breadcrumb-root">Admin</span>
              <span className="admin-topbar__breadcrumb-sep">/</span>
              <span className="admin-topbar__breadcrumb-page">{pageTitle}</span>
            </div>
          </div>

          <div className="admin-topbar__right">
            <div className="admin-topbar__datetime">
              <span className="admin-topbar__date">{dateStr}</span>
              <span className="admin-topbar__time">{timeStr}</span>
            </div>
            <div className="admin-topbar__divider" />
            <div className="admin-topbar__profile">
              <div className="admin-topbar__avatar">{adminName.charAt(0)}</div>
              <div className="admin-topbar__info">
                <span className="admin-topbar__name">{adminName}</span>
                <span className="admin-topbar__role">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        <main className="admin-main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
