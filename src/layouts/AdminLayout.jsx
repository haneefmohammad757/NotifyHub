import { useState, useCallback } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import NavItem from '../components/NavItem';
import { IconMenu, IconClose, IconOverview, IconAnnouncement, IconEvent, IconQueries, IconActivity, IconSettings } from '../components/Icons';
import './AdminLayout.css';

const adminNavItems = [
  { to: '/admin', label: 'Overview', icon: <IconOverview />, end: true },
  { to: '/admin/announcements', label: 'Announcements', icon: <IconAnnouncement /> },
  { to: '/admin/events', label: 'Events', icon: <IconEvent /> },
  { to: '/admin/queries', label: 'Queries', icon: <IconQueries /> },
  { to: '/admin/activity', label: 'Activity', icon: <IconActivity /> },
];

const adminSecondaryItems = [
  { to: '/admin/settings', label: 'Settings', icon: <IconSettings /> },
];

/** Map route paths to human-readable page titles for the topbar */
function getPageTitle(pathname) {
  const segment = pathname.replace('/admin', '').replace(/^\//, '') || 'overview';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const adminName = user?.name && user.name !== 'Admin User' ? user.name : 'Balaji Lanka';

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="admin-layout admin-theme">
      {/* Mobile header */}
      <header className="admin-mobile-header" role="banner">
        <Logo to="/admin" inverse />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="admin-topbar__avatar" style={{ flexShrink: 0 }}>{adminName.charAt(0)}</div>
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
          <Logo to="/admin" inverse />
        </div>

        <nav className="admin-sidebar__nav" onClick={closeSidebar}>
          <span className="admin-sidebar__section-label">Menu</span>
          {adminNavItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          <span className="admin-sidebar__section-label">System</span>
          {adminSecondaryItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          <button className="admin-logout-btn" onClick={logout}>Logout</button>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="admin-body">
        <div className="admin-topbar">
          <div className="admin-topbar__left">
            <h1 className="admin-topbar__title">{pageTitle}</h1>
          </div>
          <div className="admin-topbar__right">
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
