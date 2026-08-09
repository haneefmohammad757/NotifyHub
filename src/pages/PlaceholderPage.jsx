import EmptyState from '../components/EmptyState';

/**
 * Generic placeholder page used for routes that are not yet implemented.
 * Accepts a title and description to display in the empty state.
 */
export default function PlaceholderPage({ title, description }) {
  return (
    <section aria-label={title}>
      <EmptyState
        title={title}
        description={description || 'This section will be available in a future update.'}
      />
    </section>
  );
}
