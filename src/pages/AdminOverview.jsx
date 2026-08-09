import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import './AdminOverview.css';

export default function AdminOverview() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ announcements: 0, events: 0, queries: 0 });
  const [loading, setLoading] = useState(true);

  const adminName = user?.name && user.name !== 'Admin User' ? user.name : 'Balaji Lanka';

  useEffect(() => {
    async function fetchData() {
      try {
        const [announcements, events, queries] = await Promise.all([
          api.get('/announcements'),
          api.get('/events'),
          api.get('/queries')
        ]);
        setCounts({
          announcements: announcements.length || 0,
          events: events.length || 0,
          queries: queries.length || 0
        });
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="admin-overview">

      {/* Welcome Banner */}
      <div className="admin-overview__welcome">
        <div className="admin-welcome__badge">
          <span className="admin-welcome__badge-dot" />
          Control Center Active
        </div>
        <h2>{greeting}, <span>{adminName}</span> 👋</h2>
        <p>You have <strong>{loading ? '...' : counts.queries}</strong> pending quer{counts.queries === 1 ? 'y' : 'ies'}, <strong>{loading ? '...' : counts.announcements}</strong> announcement{counts.announcements !== 1 ? 's' : ''}, and <strong>{loading ? '...' : counts.events}</strong> event{counts.events !== 1 ? 's' : ''} scheduled. Manage everything from one place.</p>
      </div>

      {/* Stats Grid */}
      <div className="admin-overview__stats">
        <div className="admin-stat-card admin-stat-card--announcements">
          <div className="admin-stat-card__icon">📢</div>
          <div className="admin-stat-card__label">Total Announcements</div>
          <div className="admin-stat-card__value">{loading ? '—' : counts.announcements}</div>
          <div className="admin-stat-card__sub">Published campus notices</div>
        </div>

        <div className="admin-stat-card admin-stat-card--events">
          <div className="admin-stat-card__icon">📅</div>
          <div className="admin-stat-card__label">Upcoming Events</div>
          <div className="admin-stat-card__value">{loading ? '—' : counts.events}</div>
          <div className="admin-stat-card__sub">Scheduled campus activities</div>
        </div>

        <div className="admin-stat-card admin-stat-card--queries">
          <div className="admin-stat-card__icon">💬</div>
          <div className="admin-stat-card__label">Student Queries</div>
          <div className="admin-stat-card__value">{loading ? '—' : counts.queries}</div>
          <div className="admin-stat-card__sub">Submitted by students</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-overview__actions">
        <Link to="/admin/announcements" className="admin-quick-action">
          <div className="admin-quick-action__icon">📢</div>
          <div className="admin-quick-action__text">
            <div className="admin-quick-action__title">Manage Announcements</div>
            <div className="admin-quick-action__sub">Create, edit, or remove notices</div>
          </div>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '1rem' }}>→</span>
        </Link>

        <Link to="/admin/events" className="admin-quick-action">
          <div className="admin-quick-action__icon">📅</div>
          <div className="admin-quick-action__text">
            <div className="admin-quick-action__title">Manage Events</div>
            <div className="admin-quick-action__sub">Schedule and update events</div>
          </div>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '1rem' }}>→</span>
        </Link>

        <Link to="/admin/queries" className="admin-quick-action">
          <div className="admin-quick-action__icon">💬</div>
          <div className="admin-quick-action__text">
            <div className="admin-quick-action__title">Student Queries</div>
            <div className="admin-quick-action__sub">View and respond to students</div>
          </div>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '1rem' }}>→</span>
        </Link>

        <Link to="/admin/activity" className="admin-quick-action">
          <div className="admin-quick-action__icon">📊</div>
          <div className="admin-quick-action__text">
            <div className="admin-quick-action__title">Activity Log</div>
            <div className="admin-quick-action__sub">View all recent changes</div>
          </div>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '1rem' }}>→</span>
        </Link>
      </div>

    </div>
  );
}
