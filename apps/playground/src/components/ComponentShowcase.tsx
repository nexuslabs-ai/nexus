export function ComponentShowcase() {
  return (
    <div className="nx:space-y-8 nx:p-8">
      {/* Typography Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">Typography</h2>
        <div className="nx:border-border-default nx:bg-container nx:space-y-4 nx:rounded-lg nx:border nx:p-4">
          <div>
            <span className="nx:text-muted-foreground nx:text-xs">
              display-large
            </span>
            <p className="nx:text-display-large">Display Large</p>
          </div>
          <div>
            <span className="nx:text-muted-foreground nx:text-xs">
              display-medium
            </span>
            <p className="nx:text-display-medium">Display Medium</p>
          </div>
          <div>
            <span className="nx:text-muted-foreground nx:text-xs">
              heading-xlarge
            </span>
            <p className="nx:text-heading-xlarge">Heading XLarge</p>
          </div>
          <div>
            <span className="nx:text-muted-foreground nx:text-xs">
              heading-large
            </span>
            <p className="nx:text-heading-large">Heading Large</p>
          </div>
          <div>
            <span className="nx:text-muted-foreground nx:text-xs">
              heading-medium
            </span>
            <p className="nx:text-heading-medium">Heading Medium</p>
          </div>
          <div>
            <span className="nx:text-muted-foreground nx:text-xs">
              body-large
            </span>
            <p className="nx:text-body-large">
              Body Large - The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div>
            <span className="nx:text-muted-foreground nx:text-xs">
              body-default
            </span>
            <p className="nx:text-body-default">
              Body Default - The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div>
            <span className="nx:text-muted-foreground nx:text-xs">
              body-small
            </span>
            <p className="nx:text-body-small">
              Body Small - The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div className="nx:flex nx:gap-6">
            <div>
              <span className="nx:text-muted-foreground nx:text-xs">
                label-large
              </span>
              <p className="nx:text-label-large">Label Large</p>
            </div>
            <div>
              <span className="nx:text-muted-foreground nx:text-xs">
                label-default
              </span>
              <p className="nx:text-label-default">Label Default</p>
            </div>
            <div>
              <span className="nx:text-muted-foreground nx:text-xs">
                label-small
              </span>
              <p className="nx:text-label-small">Label Small</p>
            </div>
            <div>
              <span className="nx:text-muted-foreground nx:text-xs">
                label-caps
              </span>
              <p className="nx:text-label-caps">Label Caps</p>
            </div>
          </div>
          <div className="nx:flex nx:gap-6">
            <div>
              <span className="nx:text-muted-foreground nx:text-xs">
                code-block
              </span>
              <p className="nx:text-code-block">const x = 42;</p>
            </div>
            <div>
              <span className="nx:text-muted-foreground nx:text-xs">
                code-inline
              </span>
              <p className="nx:text-code-inline">inline code</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shadows Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">Shadows</h2>
        <div className="nx:grid nx:grid-cols-2 nx:gap-6 sm:nx:grid-cols-3 md:nx:grid-cols-4 lg:nx:grid-cols-5">
          <ShadowBox name="2xs" shadowClass="nx:shadow-2xs" />
          <ShadowBox name="xs" shadowClass="nx:shadow-xs" />
          <ShadowBox name="sm" shadowClass="nx:shadow-sm" />
          <ShadowBox name="base" shadowClass="nx:shadow-base" />
          <ShadowBox name="lg" shadowClass="nx:shadow-lg" />
          <ShadowBox name="xl" shadowClass="nx:shadow-xl" />
          <ShadowBox name="2xl" shadowClass="nx:shadow-2xl" />
          <ShadowBox name="inner" shadowClass="nx:shadow-inner" />
          <ShadowBox name="focus" shadowClass="nx:shadow-focus-default" />
        </div>
      </section>

      {/* Radius Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">Border Radius</h2>
        <div className="nx:flex nx:flex-wrap nx:gap-4">
          <RadiusBox name="base" className="nx:rounded-base" />
          <RadiusBox name="sm" className="nx:rounded-sm" />
          <RadiusBox name="md" className="nx:rounded-md" />
          <RadiusBox name="lg" className="nx:rounded-lg" />
          <RadiusBox name="xl" className="nx:rounded-xl" />
          <RadiusBox name="2xl" className="nx:rounded-2xl" />
          <RadiusBox name="3xl" className="nx:rounded-3xl" />
          <RadiusBox name="full" className="nx:rounded-full" />
        </div>
      </section>

      {/* Spacing Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">Spacing Scale</h2>
        <div className="nx:space-y-2">
          <SpacingBar name="w-1" className="nx:w-1" />
          <SpacingBar name="w-2" className="nx:w-2" />
          <SpacingBar name="w-3" className="nx:w-3" />
          <SpacingBar name="w-4" className="nx:w-4" />
          <SpacingBar name="w-5" className="nx:w-5" />
          <SpacingBar name="w-6" className="nx:w-6" />
          <SpacingBar name="w-8" className="nx:w-8" />
          <SpacingBar name="w-10" className="nx:w-10" />
          <SpacingBar name="w-12" className="nx:w-12" />
          <SpacingBar name="w-16" className="nx:w-16" />
        </div>
      </section>

      {/* Buttons Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">Buttons</h2>
        <div className="nx:flex nx:flex-wrap nx:gap-3">
          <button className="nx:bg-primary-background nx:text-primary-foreground nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium hover:nx:opacity-90">
            Primary
          </button>
          <button className="nx:bg-secondary-background nx:text-secondary-foreground nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium hover:nx:opacity-90">
            Secondary
          </button>
          <button className="nx:border-border-default nx:bg-background hover:nx:bg-accent nx:rounded-md nx:border nx:px-4 nx:py-2 nx:text-sm nx:font-medium">
            Outline
          </button>
          <button className="hover:nx:bg-accent nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium">
            Ghost
          </button>
          <button className="nx:bg-error-background nx:text-error-foreground nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium hover:nx:opacity-90">
            Destructive
          </button>
        </div>
      </section>

      {/* Color Swatches Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">Semantic Colors</h2>
        <div className="nx:grid nx:grid-cols-2 nx:gap-3 sm:nx:grid-cols-3 md:nx:grid-cols-4">
          <ColorSwatch name="Background" className="nx:bg-background" />
          <ColorSwatch
            name="Foreground"
            className="nx:bg-foreground"
            textDark
          />
          <ColorSwatch name="Primary" className="nx:bg-primary-background" />
          <ColorSwatch
            name="Secondary"
            className="nx:bg-secondary-background"
          />
          <ColorSwatch name="Muted" className="nx:bg-muted" />
          <ColorSwatch name="Accent" className="nx:bg-accent" />
          <ColorSwatch name="Success" className="nx:bg-success-background" />
          <ColorSwatch name="Error" className="nx:bg-error-background" />
          <ColorSwatch name="Warning" className="nx:bg-warning-background" />
          <ColorSwatch name="Info" className="nx:bg-information-background" />
        </div>
      </section>

      {/* Cards Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">
          Cards & Containers
        </h2>
        <div className="nx:grid nx:gap-4 md:nx:grid-cols-2">
          <div className="nx:border-border-default nx:bg-container nx:rounded-lg nx:border nx:p-4">
            <h3 className="nx:font-medium">Container</h3>
            <p className="nx:text-muted-foreground nx:mt-1 nx:text-sm">
              This is a container with default background
            </p>
          </div>
          <div className="nx:border-border-default nx:bg-popover nx:rounded-lg nx:border nx:p-4">
            <h3 className="nx:font-medium">Popover</h3>
            <p className="nx:text-muted-foreground nx:mt-1 nx:text-sm">
              This uses the popover background color
            </p>
          </div>
          <div className="nx:bg-muted nx:rounded-lg nx:p-4">
            <h3 className="nx:text-muted-foreground nx:font-medium">Muted</h3>
            <p className="nx:text-muted-foreground nx:mt-1 nx:text-sm">
              Muted background with muted foreground text
            </p>
          </div>
          <div className="nx:bg-accent nx:rounded-lg nx:p-4">
            <h3 className="nx:text-accent-foreground nx:font-medium">Accent</h3>
            <p className="nx:text-accent-foreground nx:mt-1 nx:text-sm">
              Accent background with accent foreground text
            </p>
          </div>
        </div>
      </section>

      {/* Borders Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">Borders</h2>
        <div className="nx:space-y-4">
          <div>
            <span className="nx:text-muted-foreground nx:mb-2 nx:block nx:text-xs">
              Border Width Utilities
            </span>
            <div className="nx:flex nx:flex-wrap nx:gap-3">
              <div className="nx:border-border-default nx:border-default nx:rounded nx:px-4 nx:py-2">
                border-default
              </div>
              <div className="nx:border-border-default nx:border-thick nx:rounded nx:px-4 nx:py-2">
                border-thick
              </div>
            </div>
          </div>
          <div>
            <span className="nx:text-muted-foreground nx:mb-2 nx:block nx:text-xs">
              Border Colors
            </span>
            <div className="nx:flex nx:flex-wrap nx:gap-3">
              <div className="nx:border-border-default nx:border-thick nx:rounded nx:px-4 nx:py-2">
                Default
              </div>
              <div className="nx:border-border-primary nx:border-thick nx:rounded nx:px-4 nx:py-2">
                Primary
              </div>
              <div className="nx:border-border-success nx:border-thick nx:rounded nx:px-4 nx:py-2">
                Success
              </div>
              <div className="nx:border-border-error nx:border-thick nx:rounded nx:px-4 nx:py-2">
                Error
              </div>
              <div className="nx:border-border-information nx:border-thick nx:rounded nx:px-4 nx:py-2">
                Info
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Colors Section */}
      <section>
        <h2 className="nx:mb-4 nx:text-lg nx:font-semibold">Status Colors</h2>
        <div className="nx:grid nx:gap-4 md:nx:grid-cols-2">
          <div className="nx:bg-success-surface nx:rounded-lg nx:p-4">
            <span className="nx:text-success-text nx:text-sm nx:font-medium">
              Success message
            </span>
          </div>
          <div className="nx:bg-error-surface nx:rounded-lg nx:p-4">
            <span className="nx:text-error-text nx:text-sm nx:font-medium">
              Error message
            </span>
          </div>
          <div className="nx:bg-warning-surface nx:rounded-lg nx:p-4">
            <span className="nx:text-warning-text nx:text-sm nx:font-medium">
              Warning message
            </span>
          </div>
          <div className="nx:bg-information-surface nx:rounded-lg nx:p-4">
            <span className="nx:text-information-text nx:text-sm nx:font-medium">
              Info message
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({
  name,
  className,
  textDark = false,
}: {
  name: string;
  className: string;
  textDark?: boolean;
}) {
  return (
    <div
      className={`nx:border-border-default nx:flex nx:h-20 nx:items-end nx:rounded-lg nx:border nx:p-2 ${className}`}
    >
      <span
        className={`nx:text-xs nx:font-medium ${textDark ? 'nx:text-background' : ''}`}
      >
        {name}
      </span>
    </div>
  );
}

function ShadowBox({
  name,
  shadowClass,
}: {
  name: string;
  shadowClass: string;
}) {
  return (
    <div
      className={`nx:bg-container nx:flex nx:h-20 nx:w-full nx:items-center nx:justify-center nx:rounded-lg ${shadowClass}`}
    >
      <span className="nx:text-muted-foreground nx:text-xs nx:font-medium">
        {name}
      </span>
    </div>
  );
}

function RadiusBox({ name, className }: { name: string; className: string }) {
  return (
    <div
      className={`nx:border-primary-background nx:bg-container nx:flex nx:h-16 nx:w-16 nx:items-center nx:justify-center nx:border-2 ${className}`}
    >
      <span className="nx:text-xs nx:font-medium">{name}</span>
    </div>
  );
}

function SpacingBar({ name, className }: { name: string; className: string }) {
  return (
    <div className="nx:flex nx:items-center nx:gap-3">
      <span className="nx:text-muted-foreground nx:w-12 nx:text-xs">
        {name}
      </span>
      <div className={`nx:bg-primary-background nx:h-4 ${className}`} />
    </div>
  );
}
