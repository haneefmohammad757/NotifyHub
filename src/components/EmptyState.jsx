import './EmptyState.css';

export default function EmptyState({ icon, title, description }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      {title && <h2 className="empty-state__title">{title}</h2>}
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  );
}
