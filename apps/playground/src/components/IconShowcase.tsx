import { iconLibraryMeta, iconNames, useIconStore } from '../store/iconStore';

import { PlaygroundIcon } from './PlaygroundIcon';

/**
 * IconShowcase
 *
 * Displays all available DS internal icons in a grid.
 * Icons automatically update when the library is switched.
 */
export function IconShowcase() {
  const library = useIconStore((s) => s.library);
  const meta = iconLibraryMeta[library];

  return (
    <section className="nx:bg-background nx:rounded-xl nx:border nx:border-border-default nx:overflow-hidden">
      <div className="nx:px-5 nx:py-4 nx:border-b nx:border-border-default nx:bg-muted/30">
        <div className="nx:flex nx:items-center nx:justify-between">
          <div>
            <h2 className="nx:text-base nx:font-semibold nx:text-foreground">
              Icons
            </h2>
            <p className="nx:text-sm nx:text-muted-foreground nx:mt-0.5">
              Internal DS icons from{' '}
              <a
                href={meta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nx:text-primary-text nx:underline hover:nx:no-underline"
              >
                {meta.label}
              </a>
            </p>
          </div>
          <span className="nx:text-xs nx:text-muted-foreground nx:bg-muted nx:px-2 nx:py-1 nx:rounded-full">
            {meta.iconCount} available
          </span>
        </div>
      </div>
      <div className="nx:p-5">
        <div className="nx:grid nx:grid-cols-4 nx:gap-3 nx:sm:grid-cols-5 nx:md:grid-cols-7">
          {iconNames.map((name) => (
            <div
              key={name}
              className="nx:bg-muted/50 nx:flex nx:flex-col nx:items-center nx:gap-2 nx:rounded-lg nx:p-3 hover:nx:bg-muted nx:transition-colors nx:cursor-default"
            >
              <PlaygroundIcon
                name={name}
                size={20}
                className="nx:text-foreground"
              />
              <span className="nx:text-muted-foreground nx:text-[10px] nx:text-center nx:leading-tight">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
