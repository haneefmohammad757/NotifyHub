import { useNavigate, useLocation } from 'react-router-dom';
import { getFileUrl } from '../services/api';
import './AnnouncementDetail.css';

export default function AnnouncementDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  if (!item) {
    navigate('/student', { replace: true });
    return null;
  }

  const isEvent = item._type === 'event' || item.venue || item.startTime;
  const displayDate = item.publishedAt || item.createdAt || item.date;

  return (
    <div className="detail-page">
      {/* Back bar */}
      <div className="detail-page__topbar">
        <button
          className="detail-page__back"
          onClick={() => navigate(-1)}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <button
          className="detail-page__home"
          onClick={() => navigate('/student')}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Go to Home
        </button>
      </div>

      <div className="detail-page__container">
        {/* Hero Badge */}
        <div className="detail-page__badges">
          {item.priority === 'URGENT' && (
            <span className="detail-badge detail-badge--urgent">
              🚨 Urgent
            </span>
          )}

          {item.priority === 'HIGH' && (
            <span className="detail-badge detail-badge--high">
              ⚠️ Important
            </span>
          )}

          {isEvent ? (
            <span className="detail-badge detail-badge--event">
              📅 Event
            </span>
          ) : (
            item.category && (
              <span className="detail-badge detail-badge--category">
                {item.category}
              </span>
            )
          )}
        </div>

        {/* Title */}
        <h1 className="detail-page__title">
          {item.title}
        </h1>

        {/* Meta info */}
        <div className="detail-page__meta">
          {displayDate && (
            <div className="detail-meta-item">
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

              {new Date(displayDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...(item.date ? { timeZone: 'UTC' } : {}),
              })}
            </div>
          )}

          {item.creator?.name && (
            <div className="detail-meta-item">
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>

              Published by {item.creator.name}
            </div>
          )}

          {item.venue && (
            <div className="detail-meta-item">
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>

              {item.venue}
            </div>
          )}

          {item.startTime && (
            <div className="detail-meta-item">
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              {item.startTime}
              {item.endTime ? ` – ${item.endTime}` : ''}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="detail-page__body">
          <h2 className="detail-page__body-label">
            Description
          </h2>

          <div className="detail-page__description">
            {item.description}
          </div>
        </div>

        {/* Attachment */}
        {item.attachmentUrl && (
          <div className="detail-page__attachment">
            <h2 className="detail-page__body-label">
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>

              Attachment
            </h2>

            {item.attachmentType?.startsWith('image/') ? (
              <img
                src={getFileUrl(item.attachmentUrl)}
                alt={item.attachmentName || 'Attachment'}
                className="detail-page__image"
              />
            ) : (
              <a
                href={getFileUrl(item.attachmentUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-page__pdf-link"
              >
                <span className="detail-page__pdf-icon">
                  📄
                </span>

                <div>
                  <div className="detail-page__pdf-name">
                    {item.attachmentName || 'Download Attachment'}
                  </div>

                  <div className="detail-page__pdf-sub">
                    Click to open in new tab
                  </div>
                </div>

                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ marginLeft: 'auto' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="detail-page__footer">
          <button
            className="detail-page__footer-back"
            onClick={() => navigate(-1)}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>

            Go Back
          </button>

          <button
            className="detail-page__footer-home"
            onClick={() => navigate('/student')}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>

            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}