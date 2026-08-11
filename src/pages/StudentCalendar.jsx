import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import EmptyState from '../components/EmptyState';
import AnnouncementModal from '../components/AnnouncementModal';
import { IconEvent, IconAnnouncement } from '../components/Icons';
import './StudentCalendar.css';

export default function StudentCalendar() {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function fetchData(silent = false) {
      if (!silent) setLoading(true);
      try {
        const [eventsData, announcementsData] = await Promise.all([
          api.get('/events'),
          api.get('/announcements')
        ]);
        setEvents(eventsData);
        setAnnouncements(announcementsData);
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

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const allItems = useMemo(() => {
    let items = [
      ...events.map(e => ({ ...e, _type: 'event' })),
      ...announcements.filter(a => a.deadline).map(a => ({ ...a, _type: 'announcement', date: a.deadline }))
    ];

    if (filter === 'EVENTS') {
      items = items.filter(i => i._type === 'event');
    } else if (filter === 'ANNOUNCEMENTS') {
      items = items.filter(i => i._type === 'announcement');
    }

    return items;
  }, [events, announcements, filter]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDayIndex });
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="student-calendar page-wrapper">
        <EmptyState title="Loading calendar..." description="Please wait while we fetch the latest events and deadlines." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-calendar page-wrapper">
        <EmptyState title="Error" description="Unable to load calendar data. Please try again." />
      </div>
    );
  }

  // All events & deadlines for the currently displayed month
  const currentMonthItems = allItems.filter(item => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    return itemDate.getUTCFullYear() === year && itemDate.getUTCMonth() === month;
  }).sort((a, b) => new Date(a.date).getUTCDate() - new Date(b.date).getUTCDate());

  return (
    <div className="student-calendar page-wrapper">
      <div className="calendar-header">
        <h1 className="calendar-title">Event Timeline</h1>
        <p className="calendar-subtitle">Track all events and deadlines across your semester.</p>
        
        <div className="calendar-controls">
          <div className="calendar-nav">
            <button className="btn btn--secondary" onClick={handlePrevMonth}>&larr; Prev</button>
            <button className="btn btn--secondary" onClick={handleToday}>Today</button>
            <button className="btn btn--secondary" onClick={handleNextMonth}>Next &rarr;</button>
          </div>
          <h2 className="calendar-current-month">{monthNames[month]} {year}</h2>
          <div className="calendar-filters">
            <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All</button>
            <button className={`filter-btn ${filter === 'EVENTS' ? 'active' : ''}`} onClick={() => setFilter('EVENTS')}>Events</button>
            <button className={`filter-btn ${filter === 'ANNOUNCEMENTS' ? 'active' : ''}`} onClick={() => setFilter('ANNOUNCEMENTS')}>Deadlines</button>
          </div>
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className="calendar-grid-wrapper">
        <div className="calendar-grid-header">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div className="calendar-grid">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="calendar-cell calendar-cell--blank"></div>
          ))}
          
          {days.map(day => {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            
            const dayItems = allItems.filter(item => {
              if (!item.date) return false;
              const itemDate = new Date(item.date);
              return itemDate.getUTCFullYear() === year && itemDate.getUTCMonth() === month && itemDate.getUTCDate() === day;
            });

            return (
              <div key={`day-${day}`} className={`calendar-cell ${isToday ? 'calendar-cell--today' : ''}`}>
                <div className="calendar-cell__date">{day}</div>
                <div className="calendar-cell__events">
                  {dayItems.slice(0, 3).map(item => (
                    <div 
                      key={`${item._type}-${item.id}`} 
                      className={`calendar-event calendar-event--${item._type}`}
                      onClick={() => setSelectedItem(item)}
                      title={item.title}
                    >
                      <span className="calendar-event__title">{item.title}</span>
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <div className="calendar-event__more">+{dayItems.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="calendar-legend__item">
          <span className="calendar-legend__dot calendar-legend__dot--today"></span>
          Today
        </div>
        <div className="calendar-legend__item">
          <span className="calendar-legend__dot calendar-legend__dot--event"></span>
          Events
        </div>
        <div className="calendar-legend__item">
          <span className="calendar-legend__dot calendar-legend__dot--deadline"></span>
          Deadlines
        </div>
      </div>

      {/* Events & Deadlines List Below Calendar */}
      <div className="calendar-events-section">
        <div className="calendar-events-section__header">
          <h2 className="calendar-events-section__title">
            Events & Deadlines for {monthNames[month]} {year}
          </h2>
          <span className="calendar-events-section__count">
            {currentMonthItems.length} item{currentMonthItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {currentMonthItems.length === 0 ? (
          <div className="calendar-events-empty">
            <span className="calendar-events-empty__icon">📅</span>
            <p>No events or deadlines scheduled for {monthNames[month]} {year}.</p>
          </div>
        ) : (
          <div className="calendar-events-list">
            {currentMonthItems.map(item => {
              const d = new Date(item.date);
              const dayNum = d.getUTCDate();
              const monthStr = monthNames[d.getUTCMonth()].substring(0, 3);
              const isEvent = item._type === 'event';

              return (
                <div
                  key={`list-${item._type}-${item.id}`}
                  className={`calendar-event-row ${isEvent ? 'calendar-event-row--event' : 'calendar-event-row--deadline'}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="calendar-event-row__date-badge">
                    <span className="calendar-event-row__day">{dayNum}</span>
                    <span className="calendar-event-row__month">{monthStr}</span>
                  </div>

                  <div className="calendar-event-row__body">
                    <div className="calendar-event-row__top">
                      <span className={`calendar-event-row__type ${isEvent ? 'type-event' : 'type-deadline'}`}>
                        {isEvent ? <><IconEvent width={12} height={12} /> Event</> : <><IconAnnouncement width={12} height={12} /> Deadline</>}
                      </span>
                      {item.category && <span className="calendar-event-row__category">{item.category}</span>}
                    </div>

                    <h3 className="calendar-event-row__title">{item.title}</h3>
                    
                    <div className="calendar-event-row__meta">
                      {item.startTime && <span>🕒 {item.startTime} {item.endTime ? `- ${item.endTime}` : ''}</span>}
                      {item.venue && <span>📍 {item.venue}</span>}
                    </div>
                  </div>

                  <div className="calendar-event-row__arrow">View →</div>
                </div>
              );
            })}
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
