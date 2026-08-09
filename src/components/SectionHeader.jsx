import { Link } from 'react-router-dom';
import './SectionHeader.css';

/**
 * Reusable section header with uppercase label and optional action link.
 * Used across all content sections on the Student Home and potentially other pages.
 */
export default function SectionHeader({ label, actionText, actionTo }) {
  return (
    <div className="section-header">
      <h2 className="section-header__label">{label}</h2>
      {actionText && actionTo && (
        <Link to={actionTo} className="section-header__action">
          {actionText}
        </Link>
      )}
    </div>
  );
}
