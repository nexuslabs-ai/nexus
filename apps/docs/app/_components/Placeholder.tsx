/**
 * Wireframe-style dashed placeholder block.
 * Keeps the "this is a wireframe" affordance while the chrome
 * around it is real Nexus.
 */
export type PlaceholderVariant =
  | 'default'
  | 'code'
  | 'storybook'
  | 'swatches'
  | 'diagram'
  | 'table'
  | 'tall'
  | 'hero';

export function Placeholder({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: PlaceholderVariant;
  className?: string;
}) {
  const base =
    'nx:flex nx:items-center nx:justify-center nx:p-4 nx:border nx:border-dashed nx:border-border-default nx:rounded-md nx:bg-container nx:text-muted-foreground-subtle nx:typography-label-small nx:font-mono nx:text-center';
  const variants: Record<PlaceholderVariant, string> = {
    default: 'nx:min-h-12',
    code: 'nx:bg-muted nx:justify-start nx:text-left nx:min-h-12',
    // Runtime --nx-color-* vars (not build-time @theme --color-*) so the
    // hatch flips in dark mode. muted + border-default are defined in both
    // themes (unlike container/background, which depend on the white token).
    storybook:
      'nx:min-h-60 nx:p-8 nx:bg-[repeating-linear-gradient(45deg,var(--nx-color-muted),var(--nx-color-muted)_8px,var(--nx-color-border-default)_8px,var(--nx-color-border-default)_16px)]',
    swatches: 'nx:min-h-16 nx:p-3',
    diagram: 'nx:min-h-44 nx:p-8',
    table: 'nx:min-h-32',
    hero: 'nx:min-h-24 nx:p-6 nx:typography-label-default',
    tall: 'nx:min-h-56',
  };
  return (
    <div className={`${base} ${variants[variant]} ${className}`.trim()}>
      {children}
    </div>
  );
}
