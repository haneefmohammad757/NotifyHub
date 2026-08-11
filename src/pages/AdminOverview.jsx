import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import './AdminOverview.css';

export default function AdminOverview() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ announcements: 0, events: 0, queries: 0, activity: 0 });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  var adminName = user?.name ? user.name : 'ADMIN';

  useEffect(() => {
    async function fetchData() {
      try {
        const [announcementsData, eventsData, queriesData, activityData] = await Promise.all([
          api.get('/announcements'),
          api.get('/events'),
          api.get('/queries'),
          api.get('/activity?type=All&page=1&limit=5').catch(() => ({ data: [] })),
        ]);

        setCounts({
          announcements: announcementsData.length || 0,
          events: eventsData.length || 0,
          queries: queriesData.length || 0,
          activity: activityData.data?.length || 0
        });

        setRecentAnnouncements((announcementsData || []).slice(0, 4));
        setRecentQueries((queriesData || []).filter(q => q.status === 'OPEN').slice(0, 4));
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
        <p>
          You have <strong>{loading ? '...' : counts.queries}</strong> open student quer{counts.queries === 1 ? 'y' : 'ies'},{' '}
          <strong>{loading ? '...' : counts.announcements}</strong> published announcement{counts.announcements !== 1 ? 's' : ''}, and{' '}
          <strong>{loading ? '...' : counts.events}</strong> event{counts.events !== 1 ? 's' : ''} scheduled. Manage campus updates efficiently.
        </p>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="admin-overview__stats">
        <div className="admin-stat-card admin-stat-card--announcements">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon">📢</div>
            <div className="admin-stat-card__label">Announcements</div>
          </div>
          <div className="admin-stat-card__value">{loading ? '—' : counts.announcements}</div>
          <div className="admin-stat-card__sub">Published campus notices</div>
        </div>

        <div className="admin-stat-card admin-stat-card--events">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon">📅</div>
            <div className="admin-stat-card__label">Upcoming Events</div>
          </div>
          <div className="admin-stat-card__value">{loading ? '—' : counts.events}</div>
          <div className="admin-stat-card__sub">Scheduled campus events</div>
        </div>

        <div className="admin-stat-card admin-stat-card--queries">
          <div className="admin-stat-card__header">
            <div className="admin-stat-card__icon">💬</div>
            <div className="admin-stat-card__label">Student Queries</div>
          </div>
          <div className="admin-stat-card__value">{loading ? '—' : counts.queries}</div>
          <div className="admin-stat-card__sub">Total submitted queries</div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="admin-overview__section">
        <h3 className="admin-section-title">Quick Action Hub</h3>
        <div className="admin-overview__actions-grid">
          <Link to="/admin/announcements" className="admin-quick-action">
            <div className="admin-quick-action__icon admin-quick-action__icon--purple">📢</div>
            <div className="admin-quick-action__text">
              <div className="admin-quick-action__title">Announcements Manager</div>
              <div className="admin-quick-action__sub">Create, edit, priority broadcast, or archive notices</div>
            </div>
            <span className="admin-quick-action__arrow">→</span>
          </Link>

          <Link to="/admin/events" className="admin-quick-action">
            <div className="admin-quick-action__icon admin-quick-action__icon--amber">📅</div>
            <div className="admin-quick-action__text">
              <div className="admin-quick-action__title">Event Scheduler</div>
              <div className="admin-quick-action__sub">Schedule workshops, exams, & campus activities</div>
            </div>
            <span className="admin-quick-action__arrow">→</span>
          </Link>

          <Link to="/admin/queries" className="admin-quick-action">
            <div className="admin-quick-action__icon admin-quick-action__icon--green">💬</div>
            <div className="admin-quick-action__text">
              <div className="admin-quick-action__title">Student Q&A Desk</div>
              <div className="admin-quick-action__sub">Respond to student questions & resolve issues</div>
            </div>
            <span className="admin-quick-action__arrow">→</span>
          </Link>

          <Link to="/admin/activity" className="admin-quick-action">
            <div className="admin-quick-action__icon admin-quick-action__icon--blue">📊</div>
            <div className="admin-quick-action__text">
              <div className="admin-quick-action__title">System Activity Log</div>
              <div className="admin-quick-action__sub">Audit administrative actions & system events</div>
            </div>
            <span className="admin-quick-action__arrow">→</span>
          </Link>
        </div>
      </div>

      {/* Dual Panel Preview Grid */}
      <div className="admin-overview__grid">
        {/* Recent Announcements */}
        <div className="admin-card-panel">
          <div className="admin-card-panel__header">
            <h3>Recent Announcements</h3>
            <Link to="/admin/announcements" className="admin-card-panel__link">View All →</Link>
          </div>
          <div className="admin-card-panel__body">
            {recentAnnouncements.length === 0 ? (
              <div className="admin-panel-empty">No announcements published yet.</div>
            ) : (
              <div className="admin-mini-list">
                {recentAnnouncements.map(item => (
                  <div key={item.id} className="admin-mini-item">
                    <div className="admin-mini-item__title">{item.title}</div>
                    <div className="admin-mini-item__meta">
                      <span className={`admin-badge admin-badge--${item.priority?.toLowerCase()}`}>
                        {item.priority}
                      </span>
                      <span>· {item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Queries */}
        <div className="admin-card-panel">
          <div className="admin-card-panel__header">
            <h3>Open Student Queries</h3>
            <Link to="/admin/queries" className="admin-card-panel__link">Respond →</Link>
          </div>
          <div className="admin-card-panel__body">
            {recentQueries.length === 0 ? (
              <div className="admin-panel-empty">No pending open queries. All caught up!</div>
            ) : (
              <div className="admin-mini-list">
                {recentQueries.map(q => (
                  <div key={q.id} className="admin-mini-item">
                    <div className="admin-mini-item__title">{q.subject}</div>
                    <div className="admin-mini-item__meta">
                      <span>by {q.student?.name || 'Student'}</span>
                      <span className="status-badge status-badge--open">OPEN</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
