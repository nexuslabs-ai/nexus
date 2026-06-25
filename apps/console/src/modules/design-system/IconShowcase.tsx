import { iconLibraryMeta, iconNames, useIconStore } from './iconStore';
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
    <section className="nx:bg-container nx:rounded-xl nx:border nx:border-border-default nx:overflow-hidden">
      <div className="nx:px-5 nx:py-4 nx:border-b nx:border-border-default nx:bg-background-hover-alpha">
        <div className="nx:flex nx:items-center nx:justify-between">
          <div>
            <h2 className="nx:typography-heading-xsmall nx:text-foreground">
              Icons
            </h2>
            <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-0.5">
              Internal DS icons from{' '}
              <a
                href={meta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nx:text-primary-subtle-foreground nx:underline nx:hover:no-underline"
              >
                {meta.label}
              </a>
            </p>
          </div>
          <span className="nx:typography-label-small nx:text-muted-foreground nx:bg-muted nx:px-2 nx:py-1 nx:rounded-full">
            {meta.iconCount} available
          </span>
        </div>
      </div>
      <div className="nx:p-5">
        <div className="nx:grid nx:grid-cols-4 nx:gap-3 nx:sm:grid-cols-5 nx:md:grid-cols-7">
          {iconNames.map((name) => (
            <div
              key={name}
              className="nx:bg-background-hover-alpha nx:flex nx:flex-col nx:items-center nx:gap-2 nx:rounded-lg nx:p-3 nx:hover:bg-background-hover nx:transition-colors nx:cursor-default"
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
