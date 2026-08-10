import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { IconSearch, IconArrowRight, IconAlertTriangle, IconClock, IconMapPin } from '../components/Icons';
import './StudentHome.css';

/**
 * Student Home — Redesigned Campus Dashboard
 * All API calls and data structures are unchanged.
 */

// ── Pure helpers ──────────────────────────────────────────────────────────────

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return 'Just now';
}

const PRIORITY_META = {
  URGENT:    { label: 'Urgent',    color: 'var(--urgent)',    bg: 'var(--danger-bg)'   },
  IMPORTANT: { label: 'Important', color: 'var(--important)', bg: 'var(--warning-bg)'  },
  NORMAL:    { label: 'Normal',    color: 'var(--accent)',    bg: 'var(--accent-soft)'  },
};

const CATEGORY_ICONS = {
  ACADEMIC:  '📖',
  EXAM:      '✏️',
  PLACEMENT: '💼',
  WORKSHOP:  '🛠️',
  EVENT:     '🎉',
  GENERAL:   '📌',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function PageHeader({ user, searchQuery, onSearchChange }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <div className="sh-page-header">
      <div className="sh-page-header__text">
        <p className="sh-greeting">{greeting}, <strong>{firstName}</strong></p>
        <h1 className="sh-page-title">Campus Dashboard</h1>
      </div>
      <div className="sh-search-wrap">
        <span className="sh-search-icon" aria-hidden="true"><IconSearch /></span>
        <input
          className="sh-search-input"
          type="text"
          placeholder="Search announcements, events…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search campus updates"
        />
        {searchQuery && (
          <button
            className="sh-search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >×</button>
        )}
      </div>
    </div>
  );
}

function StatsRow({ counts }) {
  const stats = [
    { key: 'urgent',  label: 'Urgent',        value: counts.urgent,   accent: 'var(--urgent)'    },
    { key: 'new',     label: 'Announcements',  value: counts.new,      accent: 'var(--accent)'    },
    { key: 'events',  label: 'Events',         value: counts.upcoming, accent: '#0EA5E9'           },
    { key: 'queries', label: 'Open Queries',   value: counts.queries,  accent: 'var(--important)' },
  ];

  return (
    <div className="sh-stats-row" role="region" aria-label="Campus status overview">
      {stats.map((s) => (
        <div className="sh-stat" key={s.key} style={{ '--stat-accent': s.accent }}>
          <span className="sh-stat__value">{s.value ?? '—'}</span>
          <span className="sh-stat__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function UrgentBanner({ items, onViewDetails }) {
  if (items.length === 0) return null;
  return (
    <div className="sh-urgent-band" aria-label="Urgent announcements">
      {items.map((item) => (
        <button
          key={item.id}
          className="sh-urgent-card"
          onClick={() => onViewDetails(item)}
          type="button"
        >
          <span className="sh-urgent-card__icon" aria-hidden="true">
            <IconAlertTriangle />
          </span>
          <div className="sh-urgent-card__body">
            <span className="sh-urgent-card__label">URGENT</span>
            <span className="sh-urgent-card__title">{item.title}</span>
            <span className="sh-urgent-card__desc">{item.description}</span>
          </div>
          <span className="sh-urgent-card__cta">
            View <IconArrowRight />
          </span>
        </button>
      ))}
    </div>
  );
}

function AnnouncementRow({ item, onViewDetails }) {
  const meta = PRIORITY_META[item.priority] || PRIORITY_META.NORMAL;
  const icon = CATEGORY_ICONS[item.category] || '📌';

  return (
    <button
      className="sh-ann-row"
      onClick={() => onViewDetails(item)}
      type="button"
    >
      <span className="sh-ann-row__icon" aria-hidden="true">{icon}</span>
      <div className="sh-ann-row__body">
        <div className="sh-ann-row__top">
          <span className="sh-ann-row__title">{item.title}</span>
          <span
            className="sh-ann-row__badge"
            style={{ color: meta.color, background: meta.bg }}
          >
            {meta.label}
          </span>
        </div>
        <div className="sh-ann-row__meta">
          <span className="sh-ann-row__cat">{item.category}</span>
          <span className="sh-ann-row__dot" aria-hidden="true">·</span>
          <span>{timeAgo(item.publishedAt || item.createdAt)}</span>
          {item.deadline && (
            <>
              <span className="sh-ann-row__dot" aria-hidden="true">·</span>
              <span className="sh-ann-row__deadline">
                Due {new Date(item.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </>
          )}
        </div>
      </div>
      <span className="sh-ann-row__arrow" aria-hidden="true"><IconArrowRight /></span>
    </button>
  );
}

function FeedSection({ items, onViewDetails }) {
  return (
    <section className="sh-section" aria-label="Announcements feed">
      <div className="sh-section__head">
        <h2 className="sh-section__title">Announcements</h2>
        <Link to="/student/discover" className="sh-section__link">View all →</Link>
      </div>
      {items.length > 0 ? (
        <div className="sh-ann-list">
          {items.map((item) => (
            <AnnouncementRow key={item.id} item={item} onViewDetails={onViewDetails} />
          ))}
        </div>
      ) : (
        <div className="sh-empty">No announcements right now.</div>
      )}
    </section>
  );
}

function EventCard({ event, onViewDetails }) {
  const date  = new Date(event.date);
  const day   = date.getUTCDate();
  const month = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });

  return (
    <button
      className="sh-event-card"
      onClick={() => onViewDetails(event)}
      type="button"
    >
      <div className="sh-event-card__date-block">
        <span className="sh-event-card__day">{day}</span>
        <span className="sh-event-card__month">{month}</span>
      </div>
      <div className="sh-event-card__body">
        <span className="sh-event-card__title">{event.title}</span>
        <div className="sh-event-card__meta">
          {event.startTime && (
            <span className="sh-event-card__detail">
              <IconClock /> {event.startTime}
            </span>
          )}
          {event.venue && (
            <span className="sh-event-card__detail">
              <IconMapPin /> {event.venue}
            </span>
          )}
        </div>
        {event.attachmentName && (
          <span className="sh-event-card__attach">📎 Attachment included</span>
        )}
      </div>
      <span className="sh-event-card__arrow" aria-hidden="true"><IconArrowRight /></span>
    </button>
  );
}

function EventsSection({ events, onViewDetails }) {
  return (
    <section className="sh-section" aria-label="Upcoming events">
      <div className="sh-section__head">
        <h2 className="sh-section__title">Upcoming Events</h2>
        <Link to="/student/calendar" className="sh-section__link">View calendar →</Link>
      </div>
      {events.length > 0 ? (
        <div className="sh-events-list">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onViewDetails={onViewDetails} />
          ))}
        </div>
      ) : (
        <div className="sh-empty">No upcoming events scheduled.</div>
      )}
    </section>
  );
}

function DeadlinesSection({ deadlines, onViewDetails }) {
  if (deadlines.length === 0) return null;
  return (
    <section className="sh-section" aria-label="Upcoming deadlines">
      <div className="sh-section__head">
        <h2 className="sh-section__title">Deadlines</h2>
      </div>
      <div className="sh-deadlines-list">
        {deadlines.map((item) => {
          const d = new Date(item.deadline);
          const daysLeft = Math.ceil((d - new Date()) / 86400000);
          const isClose  = daysLeft <= 3;
          return (
            <button
              key={item.id}
              className={`sh-deadline-row${isClose ? ' sh-deadline-row--close' : ''}`}
              onClick={() => onViewDetails(item)}
              type="button"
            >
              <div className="sh-deadline-row__date">
                <span className="sh-deadline-row__day">{d.getDate()}</span>
                <span className="sh-deadline-row__mon">
                  {d.toLocaleString('default', { month: 'short' })}
                </span>
              </div>
              <div className="sh-deadline-row__body">
                <span className="sh-deadline-row__title">{item.title}</span>
                <span className="sh-deadline-row__cat">{item.category}</span>
              </div>
              <span className={`sh-deadline-row__chip${isClose ? ' sh-deadline-row__chip--close' : ''}`}>
                {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d left`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="sh-skeleton-wrap" aria-label="Loading campus data">
      <div className="sh-skeleton sh-skeleton--heading" />
      <div className="sh-stats-row">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sh-stat sh-skeleton sh-skeleton--stat" />
        ))}
      </div>
      <div className="sh-skeleton sh-skeleton--card" />
      <div className="sh-skeleton sh-skeleton--card" />
      <div className="sh-skeleton sh-skeleton--card" />
    </div>
  );
}

function NoResults({ query, onClear }) {
  return (
    <div className="sh-no-results">
      <span className="sh-no-results__icon">🔍</span>
      <p className="sh-no-results__title">No results for <em>"{query}"</em></p>
      <p className="sh-no-results__sub">
        Try a different term or{' '}
        <button className="sh-no-results__clear" onClick={onClear} type="button">
          clear search
        </button>
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── Backend state (all unchanged from original) ─────────────────────────
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents]               = useState([]);
  const [queries, setQueries]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');

  useEffect(() => {
    async function fetchData(silent = false) {
      if (!silent) setLoading(true);
      try {
        const [announcementsData, eventsData, queriesData] = await Promise.all([
          api.get('/announcements'),
          api.get('/events'),
          api.get('/queries'),
        ]);
        setAnnouncements(announcementsData);
        setEvents(eventsData);
        setQueries(queriesData);
      } catch {
        if (!silent) setError(true);
      } finally {
        if (!silent) setLoading(false);
      }
    }
    fetchData();
    const intervalId = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Navigate to the full detail page (unchanged)
  const handleViewDetails = (item) => {
    navigate('/student/detail', { state: { item } });
  };

  // Inline search filter (unchanged)
  const filterBySearch = (items) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.venue?.toLowerCase().includes(q),
    );
  };

  // Derived lists (all unchanged logic)
  const urgentItems    = useMemo(() => filterBySearch(announcements.filter((a) => a.priority === 'URGENT')),                          [announcements, searchQuery]);
  const feedItems      = useMemo(() => filterBySearch(announcements.filter((a) => a.priority !== 'URGENT')),                          [announcements, searchQuery]);
  const upcomingEvents = useMemo(() => filterBySearch(events),                                                                        [events,        searchQuery]);
  const deadlines      = useMemo(() => filterBySearch(announcements.filter((a) => a.deadline && new Date(a.deadline) >= new Date())), [announcements, searchQuery]);
  const openQueries    = queries.filter((q) => q.status === 'OPEN');

  const hasResults = urgentItems.length > 0 || feedItems.length > 0 || upcomingEvents.length > 0 || deadlines.length > 0;

  // ─── Render states ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="sh-root">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sh-root">
        <div className="sh-error">
          <span className="sh-error__icon">⚠️</span>
          <p>Unable to load dashboard data. Please refresh and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sh-root">
      {/* Page header — greeting + search */}
      <PageHeader user={user} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Stats bar */}
      <StatsRow
        counts={{
          urgent:   urgentItems.length,
          new:      feedItems.length,
          upcoming: upcomingEvents.length,
          queries:  openQueries.length,
        }}
      />

      {/* Search: no results */}
      {searchQuery && !hasResults ? (
        <NoResults query={searchQuery} onClear={() => setSearchQuery('')} />
      ) : (
        <div className="sh-content-grid">
          {/* Left / main column */}
          <div className="sh-col-main">
            <UrgentBanner items={urgentItems} onViewDetails={handleViewDetails} />
            <FeedSection  items={feedItems}   onViewDetails={handleViewDetails} />
          </div>

          {/* Right / side column */}
          <div className="sh-col-side">
            <EventsSection    events={upcomingEvents} onViewDetails={handleViewDetails} />
            <DeadlinesSection deadlines={deadlines}   onViewDetails={handleViewDetails} />

            {/* Quick navigation links */}
            <nav className="sh-quick-links" aria-label="Quick navigation">
              <h2 className="sh-section__title" style={{ marginBottom: 'var(--space-3)' }}>
                Quick Access
              </h2>
              <Link to="/student/discover" className="sh-quick-link">
                <span className="sh-quick-link__icon">🗂️</span>
                <span>Browse All Announcements</span>
                <span className="sh-quick-link__arrow"><IconArrowRight /></span>
              </Link>
              <Link to="/student/calendar" className="sh-quick-link">
                <span className="sh-quick-link__icon">📅</span>
                <span>Full Event Calendar</span>
                <span className="sh-quick-link__arrow"><IconArrowRight /></span>
              </Link>
              <Link to="/student/queries" className="sh-quick-link">
                <span className="sh-quick-link__icon">💬</span>
                <span>My Queries</span>
                {openQueries.length > 0 && (
                  <span className="sh-quick-link__badge">{openQueries.length}</span>
                )}
                <span className="sh-quick-link__arrow"><IconArrowRight /></span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
