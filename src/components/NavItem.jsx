import { NavLink as RouterNavLink } from 'react-router-dom';
import './NavItem.css';

export default function NavItem({ to, icon, label, end = false, variant = 'default' }) {
  const variantClass = variant === 'bottom' ? ' nav-link--bottom' : '';

  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `nav-link${variantClass}${isActive ? ' nav-link--active' : ''}`
      }
    >
      {icon && (
        <span className="nav-link__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="nav-link__label">{label}</span>
    </RouterNavLink>
  );
}
