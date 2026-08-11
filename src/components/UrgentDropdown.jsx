import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './UrgentDropdown.css';

/**
 * UrgentDropdown — shows URGENT priority announcements.
 * Supports long button mode for placement directly in the main navbar.
 */
export default function UrgentDropdown({ isLongButton = false }) {
  const [open, setOpen] = useState(false);
  const [urgentItems, setUrgentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUrgent = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.get('/announcements');
      const urgent = (data || []).filter(a => a.priority === 'URGENT');
      setUrgentItems(urgent);
    } catch {
      // silent fail
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrgent();
    const id = setInterval(() => fetchUrgent(true), 15000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = urgentItems.length;

  function timeAgo(dateString) {
    if (!dateString) return '';
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className={`urgent-wrapper ${isLongButton ? 'urgent-wrapper--long' : ''}`} ref={dropdownRef}>
      <button
        className={`urgent-trigger ${isLongButton ? 'urgent-trigger--long' : ''} ${count > 0 ? 'urgent-trigger--active' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={`Urgent alerts: ${count}`}
        title="Urgent Alerts"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>

        {isLongButton && <span className="urgent-trigger__label">Urgent Alerts</span>}

        {count > 0 && (
          <span className="urgent-badge">{count > 9 ? '9+' : count}</span>
        )}
      </button>

      {open && (
        <div className="urgent-dropdown">
          <div className="urgent-dropdown__header">
            <span className="urgent-dropdown__icon">⚠️</span>
            <div>
              <h3 className="urgent-dropdown__title">Urgent Alerts</h3>
              <p className="urgent-dropdown__sub">{count} urgent announcement{count !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="urgent-dropdown__body">
            {loading ? (
              <div className="urgent-state">Loading urgent items...</div>
            ) : count === 0 ? (
              <div className="urgent-state urgent-state--empty">
                <span className="urgent-state__icon">✅</span>
                <p>No urgent alerts right now.</p>
                <span>You're all clear.</span>
              </div>
            ) : (
              <ul className="urgent-list">
                {urgentItems.map(item => (
                  <li key={item.id} className="urgent-item">
                    <div className="urgent-item__badge">URGENT</div>
                    <div className="urgent-item__content">
                      <p className="urgent-item__title">{item.title}</p>
                      {item.description && (
                        <p className="urgent-item__desc">
                          {item.description.length > 90
                            ? item.description.slice(0, 90) + '…'
                            : item.description}
                        </p>
                      )}
                      <div className="urgent-item__meta">
                        {item.category && <span className="urgent-item__cat">{item.category}</span>}
                        <span className="urgent-item__time">{timeAgo(item.publishedAt || item.createdAt)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
