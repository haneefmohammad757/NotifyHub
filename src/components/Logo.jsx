import { Link } from 'react-router-dom';
import './Logo.css';

/**
 * NotifyHub Custom Red & Grey N Logo
 */
export const NotifyHubIcon = ({ width = 42, height = 42 }) => (
  <svg width={width} height={height} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
    <defs>
      <linearGradient id="nh_red_grad" x1="40" y1="40" x2="360" y2="340" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EE1D25" />
        <stop offset="40%" stopColor="#D90429" />
        <stop offset="75%" stopColor="#B7094C" />
        <stop offset="100%" stopColor="#800F2F" />
      </linearGradient>

      <linearGradient id="nh_grey_grad" x1="240" y1="60" x2="240" y2="270" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7B828E" />
        <stop offset="40%" stopColor="#4B515D" />
        <stop offset="100%" stopColor="#2D323A" />
      </linearGradient>

      <filter id="nh_icon_shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#D90429" floodOpacity="0.25" />
      </filter>
    </defs>

    <g filter="url(#nh_icon_shadow)">
      {/* Right Grey Stem */}
      <path d="M 210 65 H 270 C 260 65 253 72 253 82 V 255 H 228 V 82 C 228 72 220 65 210 65 Z" fill="url(#nh_grey_grad)" />

      {/* Left Vertical Red Leg */}
      <path d="M 118 285 H 168 C 158 285 152 278 152 268 V 90 H 128 V 268 C 128 278 122 285 118 285 Z" fill="url(#nh_red_grad)" />

      {/* Main Swooping Red Ribbon & Diagonal N Arch */}
      <path d="M 78 190 C 42 165 28 115 50 78 C 72 40 115 42 142 62 C 162 76 182 108 202 140 C 230 184 262 235 305 272 C 328 292 355 295 322 305 C 272 320 225 285 192 235 C 168 198 145 155 125 120 C 110 95 95 68 76 68 C 60 68 48 85 52 105 C 56 125 72 155 78 190 Z" fill="url(#nh_red_grad)" />
    </g>
  </svg>
);

export const StudentIcon = NotifyHubIcon;
export const AdminIcon = NotifyHubIcon;

export default function Logo({ to = '/', inverse = false, isAdmin = false, showTagline = true }) {
  const isActuallyAdmin = isAdmin || to.includes('/admin');
  const isInverse = inverse || isActuallyAdmin;

  return (
    <Link
      to={to}
      className={`logo-brand ${isActuallyAdmin ? 'logo-brand--admin' : 'logo-brand--student'} ${isInverse ? 'logo-brand--inverse' : ''}`}
      aria-label="NotifyHub home"
    >
      <div className="logo-icon-box">
        <NotifyHubIcon width={42} height={42} />
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
