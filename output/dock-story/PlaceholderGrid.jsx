export function PlaceholderGrid({ layout, treatment, className = '' }) {
  return (
    <div
      className={`story-box-grid ${className}`}
      data-layout={layout}
      data-treatment={treatment}
      aria-hidden="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div className="story-empty-box" key={index} />
      ))}
    </div>
  );
}
