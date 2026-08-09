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
      // Only include announcements that have a deadline
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
  
  // getDay() returns 0 for Sunday
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

  // Mobile layout flat list of events for the month
  const currentMonthItems = allItems.filter(item => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    return itemDate.getUTCFullYear() === year && itemDate.getUTCMonth() === month;
  }).sort((a, b) => new Date(a.date).getUTCDate() - new Date(b.date).getUTCDate());

  return (
    <div className="student-calendar page-wrapper">
      <div className="calendar-header">
        <h1 className="calendar-title">Calendar</h1>
        <p className="calendar-subtitle">View upcoming events and deadlines.</p>
        
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

      {/* Mobile List View (Hidden on Desktop) */}
      <div className="calendar-mobile-list">
        {currentMonthItems.length === 0 ? (
          <EmptyState title="No events" description="No events scheduled for this period." />
        ) : (
          currentMonthItems.map(item => {
            const date = new Date(item.date);
            return (
              <div key={`${item._type}-${item.id}`} className="mobile-event-card" onClick={() => setSelectedItem(item)}>
                <div className="mobile-event-card__date">
                  <div className="mobile-event-card__day">{date.getUTCDate()}</div>
                  <div className="mobile-event-card__month">{monthNames[date.getUTCMonth()].substring(0,3)}</div>
                </div>
                <div className="mobile-event-card__details">
                  <div className="mobile-event-card__type">
                    {item._type === 'event' ? <><IconEvent width={12} height={12} /> Event</> : <><IconAnnouncement width={12} height={12} /> Deadline</>}
                  </div>
                  <h3 className="mobile-event-card__title">{item.title}</h3>
                  {item.startTime && <div className="mobile-event-card__time">{item.startTime}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AnnouncementModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
