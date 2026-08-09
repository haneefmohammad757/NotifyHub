import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AdminActivity.css';

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterType, setFilterType] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const filters = ['All', 'Announcement', 'Event', 'Query', 'Auth'];

  useEffect(() => {
    fetchLogs(filterType, page);
  }, [filterType, page]);

  async function fetchLogs(type, currentPage) {
    try {
      setLoading(true);
      const data = await api.get(`/activity?type=${type}&page=${currentPage}&limit=50`);
      if (currentPage === 1) {
        setLogs(data.data);
      } else {
        setLogs(prev => [...prev, ...data.data]);
      }
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      setError('Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(type) {
    setFilterType(type);
    setPage(1);
  }

  function handleLoadMore() {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }

  function getActionColor(action) {
    switch (action.toLowerCase()) {
      case 'created':
      case 'published':
        return 'var(--success)';
      case 'deleted':
      case 'archived':
        return 'var(--danger)';
      case 'updated':
      case 'status_changed':
      case 'responded':
        return 'var(--accent)';
      default:
        return 'var(--text-secondary)';
    }
  }

  function formatDateGroup(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }

  const groupedLogs = logs.reduce((acc, log) => {
    const group = formatDateGroup(log.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(log);
    return acc;
  }, {});

  return (
    <div className="admin-activity">
      <div className="admin-activity__header">
        <h2>Activity Log</h2>
        <p>Review recent administrative actions and system events.</p>
      </div>

      <div className="admin-activity__filters">
        {filters.map(filter => (
          <button
            key={filter}
            className={`admin-filter-btn ${filterType === filter ? 'admin-filter-btn--active' : ''}`}
            onClick={() => handleFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-activity__content">
        {logs.length === 0 && !loading ? (
          <div className="admin-activity__empty">No activity logs found.</div>
        ) : (
          Object.entries(groupedLogs).map(([group, groupLogs]) => (
            <div key={group} className="admin-activity__group">
              <h3 className="admin-activity__group-title">{group}</h3>
              <div className="admin-activity__list">
                {groupLogs.map(log => (
                  <div key={log.id} className="admin-activity__item">
                    <div className="admin-activity__time">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="admin-activity__timeline-node" style={{ borderColor: getActionColor(log.action) }}></div>
                    <div className="admin-activity__details">
                      <div className="admin-activity__action">
                        <span style={{ color: getActionColor(log.action), fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {log.action}
                        </span>{' '}
                        {log.entityType}
                      </div>
                      <div className="admin-activity__context">
                        {log.details ? `"${log.details}"` : `ID: ${log.entityId}`}
                      </div>
                      <div className="admin-activity__user">
                        by {log.admin?.name || 'Unknown Admin'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {loading && <div className="admin-activity__loading">Loading activity...</div>}

        {!loading && page < totalPages && (
          <button className="admin-btn-secondary admin-activity__load-more" onClick={handleLoadMore}>
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
