import React from 'react';
import './AnnouncementModal.css';

export default function AnnouncementModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="student-modal-overlay" onClick={onClose}>
      <div className="student-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="student-modal__header">
          <h2 className="student-modal__title">{item.title}</h2>
          <button className="student-modal__close" onClick={onClose} aria-label="Close modal">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="student-modal__content">
          <div className="student-modal__meta">
            {item.category && <span className="student-modal__category">{item.category}</span>}
            {item.priority === 'URGENT' && (
              <span className="student-modal__priority">URGENT</span>
            )}
            <span className="student-modal__date">
              {new Date(item.publishedAt || item.createdAt || item.date).toLocaleDateString(undefined, item.date ? { timeZone: 'UTC' } : undefined)}
            </span>
          </div>
          <div className="student-modal__description">
            {item.description}
          </div>
          {item.venue && (
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <strong>Venue:</strong> {item.venue} <br />
              <strong>Time:</strong> {item.startTime || 'TBD'} {item.endTime ? `- ${item.endTime}` : ''}
            </div>
          )}
          {item.attachmentUrl && (
            <div className="student-modal__attachment">
              {item.attachmentType?.startsWith('image/') ? (
                <img 
                  src={`http://localhost:5000${item.attachmentUrl}`} 
                  alt={item.attachmentName || 'Attachment'} 
                  className="student-modal__image-preview" 
                />
              ) : (
                <a 
                  href={`http://localhost:5000${item.attachmentUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="student-modal__pdf-link"
                >
                  <span className="student-modal__pdf-icon">📄</span>
                  Open {item.attachmentName || 'Attachment'}
                </a>
              )}
            </div>
          )}
        </div>
        <div className="student-modal__footer">
          <button className="student-modal__btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
