import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import EmptyState from '../components/EmptyState';
import AnnouncementModal from '../components/AnnouncementModal';
import { IconSearch, IconAnnouncement, IconEvent, IconClock, IconMapPin, IconArrowRight } from '../components/Icons';
import './StudentDiscover.css';

export default function StudentDiscover() {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECENT');

  useEffect(() => {
    async function fetchData(silent = false) {
      if (!silent) setLoading(true);
      try {
        const [announcementsData, eventsData] = await Promise.all([
          api.get('/announcements'),
          api.get('/events')
        ]);
        setAnnouncements(announcementsData);
        setEvents(eventsData);
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

  const filteredAndSortedItems = useMemo(() => {
    // 1. Combine and add _type
    let items = [
      ...announcements.map(a => ({ ...a, _type: 'announcement' })),
      ...events.map(e => ({ ...e, _type: 'event' }))
    ];

    // 2. Filter by type
    if (filter === 'ANNOUNCEMENTS') {
      items = items.filter(i => i._type === 'announcement');
    } else if (filter === 'EVENTS') {
      items = items.filter(i => i._type === 'event');
    }

    // 3. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => {
        const inTitle = item.title?.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inCategory = item.category?.toLowerCase().includes(q);
        const inVenue = item.venue?.toLowerCase().includes(q);
        return inTitle || inDesc || inCategory || inVenue;
      });
    }

    // 4. Sort
    items.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || a.date).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || b.date).getTime();

      if (sortBy === 'RECENT') {
        return dateB - dateA;
      }
      if (sortBy === 'UPCOMING') {
        // We want events that are closest to now, or just sort ascending by date
        return dateA - dateB;
      }
      if (sortBy === 'PRIORITY') {
        const priorityWeight = { URGENT: 3, IMPORTANT: 2, NORMAL: 1 };
        const wA = a._type === 'announcement' ? (priorityWeight[a.priority] || 0) : 0;
        const wB = b._type === 'announcement' ? (priorityWeight[b.priority] || 0) : 0;
        
        if (wA !== wB) {
          return wB - wA;
        }
        return dateB - dateA;
      }
      return 0;
    });

    return items;
  }, [announcements, events, filter, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="student-discover page-wrapper">
        <EmptyState title="Loading campus updates..." description="Please wait while we fetch the latest information." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-discover page-wrapper">
        <EmptyState title="Error" description="Unable to load campus updates. Please try again." />
      </div>
    );
  }

  return (
    <div className="student-discover page-wrapper">
      <div className="discover-header">
        <h1 className="discover-title">Explore Campus</h1>
        <p className="discover-subtitle">Browse all announcements and events — sorted, filtered, and always live.</p>
        
        <div className="discover-search-bar">
          <IconSearch />
          <input 
            type="text" 
            placeholder="Search by title, description, category, or venue..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="discover-controls">
          <div className="discover-filters">
            <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All</button>
            <button className={`filter-btn ${filter === 'ANNOUNCEMENTS' ? 'active' : ''}`} onClick={() => setFilter('ANNOUNCEMENTS')}>Announcements</button>
            <button className={`filter-btn ${filter === 'EVENTS' ? 'active' : ''}`} onClick={() => setFilter('EVENTS')}>Events</button>
          </div>
          <div className="discover-sort">
            <label htmlFor="sort-select">Sort by:</label>
            <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="RECENT">Most Recent</option>
              <option value="UPCOMING">Upcoming First</option>
              <option value="PRIORITY">Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      <div className="discover-results">
        {filteredAndSortedItems.length === 0 ? (
          <EmptyState title="No matching updates found" description="Try adjusting your search or filters to see more results." />
        ) : (
          <div className="discover-list">
            {filteredAndSortedItems.map((item) => (
              <div className="discover-card" key={`${item._type}-${item.id}`} onClick={() => setSelectedItem(item)}>
                <div className="discover-card__icon">
                  {item._type === 'announcement' ? <IconAnnouncement /> : <IconEvent />}
                </div>
                <div className="discover-card__content">
                  <div className="discover-card__meta">
                    <span className="discover-card__type">
                      {item._type === 'announcement' ? 'Announcement' : 'Event'}
                    </span>
                    {item.category && <span className="discover-card__category">· {item.category}</span>}
                    {item.priority === 'URGENT' && <span className="discover-card__priority">· URGENT</span>}
                    <span className="discover-card__date">
                      · {new Date(item.publishedAt || item.createdAt || item.date).toLocaleDateString(undefined, item._type === 'event' ? { timeZone: 'UTC' } : undefined)}
                    </span>
                  </div>
                  <h3 className="discover-card__title">{item.title}</h3>
                  <p className="discover-card__description">
                    {item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description}
                  </p>
                  {item._type === 'event' && item.venue && (
                    <div className="discover-card__venue">
                      <IconMapPin /> {item.venue}
                    </div>
                  )}
                </div>
                <div className="discover-card__action">
                  <IconArrowRight />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnnouncementModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
