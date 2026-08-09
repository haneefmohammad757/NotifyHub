import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <EmptyState
          title="Page not found"
          description="The page you're looking for doesn't exist or has been moved."
        />
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#F7F7F4',
            backgroundColor: '#111318',
            borderRadius: '6px',
            textDecoration: 'none',
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
