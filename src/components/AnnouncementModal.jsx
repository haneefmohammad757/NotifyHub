import React from 'react';
import { getFileUrl } from '../services/api';
import './AnnouncementModal.css';

export default function AnnouncementModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div
      className="student-modal"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="student-modal__content">
        <button
          className="student-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2>{item.title}</h2>

        <div className="student-modal__meta">
          {item.category && <span>{item.category}</span>}

          {item.priority === 'URGENT' && (
            <span className="student-modal__urgent">URGENT</span>
          )}

          <span>
            {new Date(
              item.publishedAt || item.createdAt || item.date
            ).toLocaleDateString(
              undefined,
              item.date ? { timeZone: 'UTC' } : undefined
            )}
          </span>
        </div>

        <div className="student-modal__description">
          {item.description}
        </div>

        {item.venue && (
          <div
            style={{
              marginTop: '1rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div>Venue: {item.venue}</div>
            <div>
              Time: {item.startTime || 'TBD'}
              {item.endTime ? ` - ${item.endTime}` : ''}
            </div>
          </div>
        )}

        {item.attachmentUrl && (
          <div className="student-modal__attachment">
            {item.attachmentType?.startsWith('image/') ? (
              <img
                src={getFileUrl(item.attachmentUrl)}
                alt={item.attachmentName || 'Attachment'}
                className="student-modal__image-preview"
              />
            ) : (
              <a
                href={getFileUrl(item.attachmentUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="student-modal__pdf-link"
              >
                📄 Open {item.attachmentName || 'Attachment'}
              </a>
            )}
          </div>
        )}

        <button
          type="button"
          className="student-modal__close-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}