export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      className="spinner"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="page-spinner">
      <Spinner size={36} />
      <span className="muted">Loading…</span>
    </div>
  );
}

export function CardSkeletonGrid() {
  return (
    <div className="ticket-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="ticket-card skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
          <div className="skeleton-badges">
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-badge" />
          </div>
        </div>
      ))}
    </div>
  );
}
