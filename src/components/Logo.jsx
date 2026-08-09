import { Link } from 'react-router-dom';
import './Logo.css';

export const NotifyHubIcon = ({ width = 42, height = 42 }) => (
  <svg width={width} height={height} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
    <defs>
      {/* Ribbon N Gradients */}
      <linearGradient id="nh_n_grad1" x1="12" y1="12" x2="36" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00E5FF" />
        <stop offset="0.5" stopColor="#8C7CFF" />
        <stop offset="1" stopColor="#D946EF" />
      </linearGradient>

      <linearGradient id="nh_n_grad2" x1="22" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8C7CFF" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#FBBF24" />
      </linearGradient>

      <radialGradient id="nh_glow" cx="32" cy="32" r="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8C7CFF" stopOpacity="0.35" />
        <stop offset="0.7" stopColor="#00E5FF" stopOpacity="0.1" />
        <stop offset="1" stopColor="#00E5FF" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="nh_dot_grad" x1="34" y1="20" x2="40" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>

      <linearGradient id="nh_ring_grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00E5FF" stopOpacity="0.5" />
        <stop offset="0.5" stopColor="#8C7CFF" stopOpacity="0.3" />
        <stop offset="1" stopColor="#FBBF24" stopOpacity="0.5" />
      </linearGradient>
    </defs>

    {/* Background Glow */}
    <circle cx="32" cy="32" r="26" fill="url(#nh_glow)" />

    {/* Orbital Rings */}
    <circle cx="32" cy="32" r="28" stroke="url(#nh_ring_grad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    <circle cx="32" cy="32" r="24" stroke="url(#nh_ring_grad)" strokeWidth="0.75" opacity="0.3" />

    {/* Floating Orbital Spheres */}
    <circle cx="10" cy="22" r="2.2" fill="#00E5FF" />
    <circle cx="52" cy="26" r="2.5" fill="#D946EF" />
    <circle cx="18" cy="50" r="1.8" fill="#FBBF24" />

    {/* 3D Ribbon 'N' Emblem */}
    <path
      d="M18 46V22C18 16.4772 22.4772 12 28 12C33.5228 12 38 16.4772 38 22V30"
      stroke="url(#nh_n_grad1)"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    <path
      d="M26 18L44 42V24C44 17.3726 38.6274 12 32 12"
      stroke="url(#nh_n_grad2)"
      strokeWidth="6.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Center Golden Pin Dot */}
    <circle cx="38" cy="24" r="3.5" fill="url(#nh_dot_grad)" />
    <circle cx="38" cy="24" r="1.5" fill="#FFFFFF" />
  </svg>
);

export const StudentIcon = NotifyHubIcon;
export const AdminIcon = NotifyHubIcon;

export default function Logo({ to = '/', inverse = false, isAdmin = false, showTagline = true }) {
  const isActuallyAdmin = isAdmin || to.includes('/admin');
  const isInverse = inverse || isActuallyAdmin;

  return (
    <Link to={to} className={`logo-brand ${isActuallyAdmin ? 'logo-brand--admin' : 'logo-brand--student'} ${isInverse ? 'logo-brand--inverse' : ''}`} aria-label="NotifyHub home">
      <div className="logo-icon-box">
        <NotifyHubIcon width={42} height={42} />
      </div>
      <div className="logo-text-block">
        <div className="logo-title-row">
          <span className="logo-notify-text">Notify</span>
          <span className="logo-hub-text">Hub</span>
          {isActuallyAdmin && <span className="admin-tag">ADMIN</span>}
        </div>
        {showTagline && (
          <div className="logo-tagline-row">
            <span className="tag-connect">CONNECT</span>
            <span className="tag-dot">•</span>
            <span className="tag-inform">INFORM</span>
            <span className="tag-dot">•</span>
            <span className="tag-empower">EMPOWER</span>
          </div>
        )}
      </div>
    </Link>
  );
}
