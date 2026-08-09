import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SectionHeader from '../components/SectionHeader';
import { IconSearch, IconArrowRight, IconAlertTriangle, IconClock, IconMapPin } from '../components/Icons';
import './StudentHome.css';

/**
 * Student Home — Campus Pulse
 */

// Format time nicely
function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
}

function CampusPulseHero() {
  return (
    <section className="campus-pulse" aria-label="Campus Pulse">
      <div className="campus-pulse__badge">
        <span className="campus-pulse__dot" aria-hidden="true"></span>
        Live Campus Feed
      </div>
      <h1 className="campus-pulse__title">Campus Pulse</h1>
      <p className="campus-pulse__subtitle">
        Everything happening around your campus — announcements, events, deadlines, and updates.
      </p>
    </section>
  );
}

function SearchEntry({ searchQuery, onSearchChange }) {
  return (
    <div className="search-entry">
      <div className="search-entry__bar" role="search">
        <span className="search-entry__icon" aria-hidden="true">
          <IconSearch />
        </span>
        <input
          className="search-entry__input"
          type="text"
          placeholder="Search announcements, events, deadlines..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search campus updates"
        />
        {searchQuery && (
          <button
            className="search-entry__clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      {!searchQuery && (
        <Link to="/student/discover" className="search-entry__discover">
          Browse All →
        </Link>
      )}
    </div>
  );
}

function StatusSummary({ counts }) {
  return (
    <div className="status-summary" role="region" aria-label="Campus status summary">
      <div className="status-card status-card--urgent">
        <div className="status-card__label">Urgent</div>
        <div className={`status-card__value ${counts.urgent === 0 ? 'status-card__value--empty' : ''}`}>
          {counts.urgent === 0 ? 'None' : counts.urgent}
        </div>
      </div>
      <div className="status-card">
        <div className="status-card__label">New</div>
        <div className={`status-card__value ${counts.new === 0 ? 'status-card__value--empty' : ''}`}>
          {counts.new === 0 ? '—' : counts.new}
        </div>
      </div>
      <div className="status-card">
        <div className="status-card__label">Upcoming</div>
        <div className={`status-card__value ${counts.upcoming === 0 ? 'status-card__value--empty' : ''}`}>
          {counts.upcoming === 0 ? '—' : counts.upcoming}
        </div>
      </div>
      <div className="status-card">
        <div className="status-card__label">Open Queries</div>
        <div className={`status-card__value ${counts.queries === 0 ? 'status-card__value--empty' : ''}`}>
          {counts.queries === 0 ? '—' : counts.queries}
        </div>
      </div>
    </div>
  );
}

function UrgentSection({ items, onViewDetails }) {
  return (
    <section className="urgent-section" aria-label="Urgent announcements">
      <SectionHeader label="Urgent" />
      {items.length > 0 ? (
        items.map((item) => (
          <div 
            className="urgent-banner" 
            key={item.id}
            onClick={() => onViewDetails(item)}
            style={{ cursor: 'pointer' }}
          >
            <span className="urgent-banner__icon" aria-hidden="true">
              <IconAlertTriangle />
            </span>
            <div className="urgent-banner__content">
              <div className="urgent-banner__title">{item.title}</div>
              <p className="urgent-banner__description">{item.description}</p>
            </div>
            <span className="urgent-banner__action">
               View details <IconArrowRight />
            </span>
          </div>
        ))
      ) : (
        <div className="urgent-empty">
          No urgent announcements right now.
        </div>
      )}
    </section>
  );
}

function FeedSection({ items, onViewDetails }) {
  return (
    <section className="feed-section" aria-label="Campus feed">
      <SectionHeader label="The Feed" actionText="View all" actionTo="/student/discover" />
      {items.length > 0 ? (
        <div className="feed-list">
          {items.map((item) => (
            <div 
              className={`feed-item feed-item--priority-${item.priority}`} 
              key={item.id}
              onClick={() => onViewDetails(item)}
              style={{ cursor: 'pointer' }}
            >
              <span className="feed-item__indicator" aria-hidden="true"></span>
              <div className="feed-item__body">
                <div className="feed-item__category">{item.category}</div>
                <div className="feed-item__title">{item.title}</div>
                <div className="feed-item__meta">
                  {item.creator?.name || 'Balaji Lanka'} · {timeAgo(item.publishedAt || item.createdAt)}
                </div>
              </div>
              <span className="feed-item__action">
                View <IconArrowRight />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="feed-empty">
          <div>No new campus updates yet.</div>
          <div className="feed-empty__sub">Check back later for announcements and updates.</div>
        </div>
      )}
    </section>
  );
}

function EventsSection({ events, onViewDetails }) {
  return (
    <section className="events-section" aria-label="Upcoming events">
      <SectionHeader label="Upcoming Events" actionText="View calendar" actionTo="/student/calendar" />
      {events.length > 0 ? (
        <div className="events-list">
          {events.map((event) => {
            const date = new Date(event.date);
            return (
              <div 
                className="event-card" 
                key={event.id}
                onClick={() => onViewDetails(event)}
                style={{ cursor: 'pointer' }}
              >
                <div className="event-card__date">
                  <div className="event-card__day">{date.getUTCDate()}</div>
                  <div className="event-card__month">
                    {date.toLocaleString('default', { month: 'short', timeZone: 'UTC' })}
                  </div>
                </div>
                <div className="event-card__info">
                  <div className="event-card__title">{event.title}</div>
                  <div className="event-card__details">
                    <span className="event-card__detail">
                      <IconClock /> {event.startTime || 'TBD'}
                    </span>
                    <span className="event-card__detail">
                      <IconMapPin /> {event.venue || 'TBD'}
                    </span>
                  </div>
                  {event.attachmentName && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginTop: '0.25rem' }}>
                      📎 Attachment / PDF Included
                    </div>
                  )}
                  <span className="event-card__action" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)' }}>
                    View details & attachment <IconArrowRight />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="feed-empty">
          <div>No upcoming events.</div>
          <div className="feed-empty__sub">Events will appear here when they're scheduled.</div>
        </div>
      )}
    </section>
  );
}

function DeadlinesSection({ deadlines, onViewDetails }) {
  return (
    <section className="deadlines-section" aria-label="Deadlines">
      <SectionHeader label="Deadlines" />
      {deadlines.length > 0 ? (
        <div className="feed-list">
          {deadlines.map((item) => {
            const date = new Date(item.deadline);
            return (
              <div 
                className="feed-item" 
                key={item.id} 
                style={{ borderLeftColor: 'var(--important)', cursor: 'pointer' }}
                onClick={() => onViewDetails(item)}
              >
                <div className="feed-item__body">
                  <div className="feed-item__category" style={{ color: 'var(--important)' }}>DUE {date.toLocaleDateString()}</div>
                  <div className="feed-item__title">{item.title}</div>
                </div>
                <span className="feed-item__action">
                  View <IconArrowRight />
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="deadline-empty">No upcoming deadlines.</div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                               */
/* ------------------------------------------------------------------ */

export default function StudentHome() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData(silent = false) {
      if (!silent) setLoading(true);
      try {
        const [announcementsData, eventsData, queriesData] = await Promise.all([
          api.get('/announcements'),
          api.get('/events'),
          api.get('/queries')
        ]);
        setAnnouncements(announcementsData);
        setEvents(eventsData);
        setQueries(queriesData);
      } catch (err) {
        if (!silent) setError(true);
      } finally {
        if (!silent) setLoading(false);
      }
    }
    fetchData();
    const intervalId = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Navigate to the full detail page instead of showing a modal
  const handleViewDetails = (item) => {
    navigate('/student/detail', { state: { item } });
  };

  // Inline search filter
  const filterBySearch = (items) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.venue?.toLowerCase().includes(q)
    );
  };

  const urgentItems = useMemo(() => filterBySearch(announcements.filter(a => a.priority === 'URGENT')), [announcements, searchQuery]);
  const feedItems = useMemo(() => filterBySearch(announcements.filter(a => a.priority !== 'URGENT')), [announcements, searchQuery]);
  const upcomingEvents = useMemo(() => filterBySearch(events), [events, searchQuery]);
  const deadlines = useMemo(() => filterBySearch(announcements.filter(a => a.deadline && new Date(a.deadline) >= new Date())), [announcements, searchQuery]);
  const openQueries = queries.filter(q => q.status === 'OPEN');

  // Show "no results" when searching
  const hasResults = urgentItems.length > 0 || feedItems.length > 0 || upcomingEvents.length > 0 || deadlines.length > 0;

  if (loading) {
    return (
      <div className="student-home">
        <CampusPulseHero />
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
          Loading campus updates...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-home">
        <CampusPulseHero />
        <div className="auth-error" style={{ margin: 'var(--space-4)' }}>
          Unable to load dashboard data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="student-home">
      <CampusPulseHero />
      <SearchEntry searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <StatusSummary counts={{ urgent: urgentItems.length, new: feedItems.length, upcoming: upcomingEvents.length, queries: openQueries.length }} />

      {searchQuery && !hasResults ? (
        <div className="search-no-results">
          <div className="search-no-results__icon">🔍</div>
          <div className="search-no-results__title">No results for "{searchQuery}"</div>
          <div className="search-no-results__sub">Try a different search term or <button onClick={() => setSearchQuery('')} className="search-no-results__clear">clear search</button></div>
        </div>
      ) : (
        <>
          <UrgentSection items={urgentItems} onViewDetails={handleViewDetails} />
          <FeedSection items={feedItems} onViewDetails={handleViewDetails} />
          <EventsSection events={upcomingEvents} onViewDetails={handleViewDetails} />
          <DeadlinesSection deadlines={deadlines} onViewDetails={handleViewDetails} />
        </>
      )}
    </div>
  );
}
