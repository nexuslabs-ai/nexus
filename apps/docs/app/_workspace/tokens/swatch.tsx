export function Swatch({ color }: { color: string | undefined }) {
  return (
    <span
      aria-hidden="true"
      className="nx:block nx:size-4 nx:shrink-0 nx:rounded-sm nx:border-default nx:border-border-default"
      style={{ backgroundColor: color }}
    />
  );
}
