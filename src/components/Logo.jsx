import { Link } from 'react-router-dom';
import './Logo.css';

/**
 * NotifyHub Modern Slashed N Logo Component
 */
export const NotifyHubIcon = ({ width = 42, height = 42, className = '' }) => (
  <img
    src="/logo.png"
    alt="NotifyHub Logo"
    width={width}
    height={height}
    className={`logo-img ${className}`}
    style={{
      objectFit: 'contain',
      display: 'block',
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }}
  />
);

export const StudentIcon = NotifyHubIcon;
export const AdminIcon = NotifyHubIcon;

export default function Logo({ to = '/', inverse = false, isAdmin = false, showTagline = true, size = 'medium' }) {
  const isActuallyAdmin = isAdmin || to.includes('/admin');
  const isInverse = inverse || isActuallyAdmin;
  const iconSize = size === 'large' ? 52 : size === 'small' ? 32 : 42;

  return (
    <Link
      to={to}
      className={`logo-brand logo-brand--${size} ${isActuallyAdmin ? 'logo-brand--admin' : 'logo-brand--student'} ${isInverse ? 'logo-brand--inverse' : ''}`}
      aria-label="NotifyHub home"
    >
      <div className="logo-icon-box">
        <NotifyHubIcon width={iconSize} height={iconSize} />
      </div>
      <div className="logo-text-block">
        <div className="logo-title-row">
          <span className="logo-wordmark">NOTIFYHUB</span>
          {isActuallyAdmin && <span className="admin-tag">ADMIN</span>}
        </div>
        {showTagline && (
          <div className="logo-tagline-row">
            <span className="logo-tagline-text">From Campus, For Students</span>
          </div>
        )}
      </div>
    </Link>
  );
}

