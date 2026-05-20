import { IconShowcase } from './IconShowcase';

// Reusable section component
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="nx:bg-background nx:rounded-xl nx:border nx:border-border-default nx:overflow-hidden">
      <div className="nx:px-5 nx:py-4 nx:border-b nx:border-border-default nx:bg-muted/30">
        <h2 className="nx:text-base nx:font-semibold nx:text-foreground">
          {title}
        </h2>
        {description && (
          <p className="nx:text-sm nx:text-muted-foreground nx:mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="nx:p-5">{children}</div>
    </section>
  );
}

export function ComponentShowcase() {
  return (
    <div className="nx:bg-muted/30 nx:min-h-screen">
      <div className="nx:p-6 nx:space-y-6">
        {/* Typography Section */}
        <Section title="Typography" description="Text styles and font scales">
          <div className="nx:space-y-6">
            {/* Display */}
            <div className="nx:space-y-2">
              <span className="nx:text-xs nx:font-medium nx:text-muted-foreground nx:uppercase nx:tracking-wide">
                Display
              </span>
              <div className="nx:space-y-1">
                <p className="nx:typography-display-large">Display Large</p>
                <p className="nx:typography-display-medium">Display Medium</p>
              </div>
            </div>

            {/* Headings */}
            <div className="nx:space-y-2">
              <span className="nx:text-xs nx:font-medium nx:text-muted-foreground nx:uppercase nx:tracking-wide">
                Headings
              </span>
              <div className="nx:space-y-1">
                <p className="nx:typography-heading-xlarge">Heading XLarge</p>
                <p className="nx:typography-heading-large">Heading Large</p>
                <p className="nx:typography-heading-medium">Heading Medium</p>
              </div>
            </div>

            {/* Body */}
            <div className="nx:space-y-2">
              <span className="nx:text-xs nx:font-medium nx:text-muted-foreground nx:uppercase nx:tracking-wide">
                Body
              </span>
              <div className="nx:space-y-2">
                <p className="nx:typography-body-large">
                  Body Large - The quick brown fox jumps over the lazy dog.
                </p>
                <p className="nx:typography-body-default">
                  Body Default - The quick brown fox jumps over the lazy dog.
                </p>
                <p className="nx:typography-body-small">
                  Body Small - The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>

            {/* Labels & Code */}
            <div className="nx:grid nx:grid-cols-2 nx:gap-6">
              <div className="nx:space-y-2">
                <span className="nx:text-xs nx:font-medium nx:text-muted-foreground nx:uppercase nx:tracking-wide">
                  Labels
                </span>
                <div className="nx:flex nx:flex-wrap nx:gap-4">
                  <span className="nx:typography-label-large">Label Large</span>
                  <span className="nx:typography-label-default">
                    Label Default
                  </span>
                  <span className="nx:typography-label-small">Label Small</span>
                  <span className="nx:typography-label-caps">Label Caps</span>
                </div>
              </div>
              <div className="nx:space-y-2">
                <span className="nx:text-xs nx:font-medium nx:text-muted-foreground nx:uppercase nx:tracking-wide">
                  Code
                </span>
                <div className="nx:flex nx:flex-wrap nx:gap-4">
                  <code className="nx:typography-code-block nx:bg-muted nx:px-2 nx:py-1 nx:rounded">
                    const x = 42;
                  </code>
                  <code className="nx:typography-code-inline nx:bg-muted nx:px-1.5 nx:py-0.5 nx:rounded">
                    inline
                  </code>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Colors Section */}
        <Section
          title="Semantic Colors"
          description="Brand and status color palette"
        >
          <div className="nx:grid nx:grid-cols-2 nx:gap-4 nx:sm:grid-cols-3 nx:md:grid-cols-5">
            <ColorSwatch
              name="Background"
              className="nx:bg-background"
              border
            />
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
            <ColorSwatch name="Muted Light" className="nx:bg-muted-light" />
            <ColorSwatch name="Success" className="nx:bg-success-background" />
            <ColorSwatch name="Error" className="nx:bg-error-background" />
            <ColorSwatch name="Warning" className="nx:bg-warning-background" />
            <ColorSwatch name="Info" className="nx:bg-information-background" />
          </div>
        </Section>

        {/* Shadows Section */}
        <Section title="Shadows" description="Elevation and depth">
          <div className="nx:grid nx:grid-cols-3 nx:gap-4 nx:sm:grid-cols-4 nx:md:grid-cols-5">
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
        </Section>

        {/* Radius Section */}
        <Section title="Border Radius" description="Corner rounding styles">
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
        </Section>

        {/* Spacing Section */}
        <Section title="Spacing Scale" description="Consistent spacing units">
          <div className="nx:space-y-2">
            <SpacingBar name="1" className="nx:w-1" />
            <SpacingBar name="2" className="nx:w-2" />
            <SpacingBar name="3" className="nx:w-3" />
            <SpacingBar name="4" className="nx:w-4" />
            <SpacingBar name="5" className="nx:w-5" />
            <SpacingBar name="6" className="nx:w-6" />
            <SpacingBar name="8" className="nx:w-8" />
            <SpacingBar name="10" className="nx:w-10" />
            <SpacingBar name="12" className="nx:w-12" />
            <SpacingBar name="16" className="nx:w-16" />
          </div>
        </Section>

        {/* Icons Section */}
        <IconShowcase />

        {/* Buttons Section */}
        <Section title="Buttons" description="Interactive button variants">
          <div className="nx:space-y-4">
            <div className="nx:flex nx:flex-wrap nx:gap-3">
              <button className="nx:bg-primary-background nx:text-primary-foreground nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium nx:hover:opacity-90 nx:transition-opacity">
                Primary
              </button>
              <button className="nx:bg-secondary-background nx:text-secondary-foreground nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium nx:hover:opacity-90 nx:transition-opacity">
                Secondary
              </button>
              <button className="nx:border nx:border-border-default nx:bg-background nx:hover:bg-background-hover nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium nx:transition-colors">
                Outline
              </button>
              <button className="nx:hover:bg-background-hover nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium nx:transition-colors">
                Ghost
              </button>
              <button className="nx:bg-error-background nx:text-error-foreground nx:rounded-md nx:px-4 nx:py-2 nx:text-sm nx:font-medium nx:hover:opacity-90 nx:transition-opacity">
                Destructive
              </button>
            </div>
          </div>
        </Section>

        {/* Cards Section */}
        <Section
          title="Cards & Containers"
          description="Surface styles and containers"
        >
          <div className="nx:grid nx:gap-4 nx:md:grid-cols-2">
            <div className="nx:border nx:border-border-default nx:bg-container nx:rounded-lg nx:p-4">
              <h3 className="nx:font-medium">Container</h3>
              <p className="nx:text-muted-foreground nx:mt-1 nx:text-sm">
                Default container background
              </p>
            </div>
            <div className="nx:border nx:border-border-default nx:bg-popover nx:rounded-lg nx:p-4">
              <h3 className="nx:font-medium">Popover</h3>
              <p className="nx:text-muted-foreground nx:mt-1 nx:text-sm">
                Popover background color
              </p>
            </div>
            <div className="nx:bg-muted nx:rounded-lg nx:p-4">
              <h3 className="nx:text-muted-foreground nx:font-medium">Muted</h3>
              <p className="nx:text-muted-foreground nx:mt-1 nx:text-sm">
                Muted background with muted foreground
              </p>
            </div>
            <div className="nx:bg-background-hover nx:rounded-lg nx:p-4">
              <h3 className="nx:text-foreground nx:font-medium">
                Background Hover
              </h3>
              <p className="nx:text-muted-foreground nx:mt-1 nx:text-sm">
                Hover-state background color
              </p>
            </div>
          </div>
        </Section>

        {/* Borders Section */}
        <Section title="Borders" description="Border widths and colors">
          <div className="nx:space-y-4">
            <div>
              <span className="nx:text-xs nx:font-medium nx:text-muted-foreground nx:uppercase nx:tracking-wide">
                Width
              </span>
              <div className="nx:flex nx:flex-wrap nx:gap-3 nx:mt-2">
                <div className="nx:border nx:border-border-default nx:border-default nx:rounded nx:px-4 nx:py-2 nx:text-sm">
                  default
                </div>
                <div className="nx:border nx:border-border-default nx:border-thick nx:rounded nx:px-4 nx:py-2 nx:text-sm">
                  thick
                </div>
              </div>
            </div>
            <div>
              <span className="nx:text-xs nx:font-medium nx:text-muted-foreground nx:uppercase nx:tracking-wide">
                Colors
              </span>
              <div className="nx:flex nx:flex-wrap nx:gap-3 nx:mt-2">
                <div className="nx:border-2 nx:border-border-default nx:rounded nx:px-4 nx:py-2 nx:text-sm">
                  Default
                </div>
                <div className="nx:border-2 nx:border-border-primary nx:rounded nx:px-4 nx:py-2 nx:text-sm">
                  Primary
                </div>
                <div className="nx:border-2 nx:border-border-success nx:rounded nx:px-4 nx:py-2 nx:text-sm">
                  Success
                </div>
                <div className="nx:border-2 nx:border-border-error nx:rounded nx:px-4 nx:py-2 nx:text-sm">
                  Error
                </div>
                <div className="nx:border-2 nx:border-border-information nx:rounded nx:px-4 nx:py-2 nx:text-sm">
                  Info
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Status Colors Section */}
        <Section
          title="Status Messages"
          description="Feedback and alert styles"
        >
          <div className="nx:grid nx:gap-4 nx:md:grid-cols-2">
            <div className="nx:bg-success-subtle nx:rounded-lg nx:p-4 nx:flex nx:items-center nx:gap-3">
              <div className="nx:w-2 nx:h-2 nx:rounded-full nx:bg-success-background" />
              <span className="nx:text-success-subtle-foreground nx:text-sm nx:font-medium">
                Success message
              </span>
            </div>
            <div className="nx:bg-error-subtle nx:rounded-lg nx:p-4 nx:flex nx:items-center nx:gap-3">
              <div className="nx:w-2 nx:h-2 nx:rounded-full nx:bg-error-background" />
              <span className="nx:text-error-subtle-foreground nx:text-sm nx:font-medium">
                Error message
              </span>
            </div>
            <div className="nx:bg-warning-subtle nx:rounded-lg nx:p-4 nx:flex nx:items-center nx:gap-3">
              <div className="nx:w-2 nx:h-2 nx:rounded-full nx:bg-warning-background" />
              <span className="nx:text-warning-subtle-foreground nx:text-sm nx:font-medium">
                Warning message
              </span>
            </div>
            <div className="nx:bg-information-subtle nx:rounded-lg nx:p-4 nx:flex nx:items-center nx:gap-3">
              <div className="nx:w-2 nx:h-2 nx:rounded-full nx:bg-information-background" />
              <span className="nx:text-information-subtle-foreground nx:text-sm nx:font-medium">
                Info message
              </span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function ColorSwatch({
  name,
  className,
  textDark = false,
  border = false,
}: {
  name: string;
  className: string;
  textDark?: boolean;
  border?: boolean;
}) {
  return (
    <div
      className={`nx:flex nx:h-20 nx:items-end nx:rounded-lg nx:p-3 ${className} ${
        border ? 'nx:border nx:border-border-default' : ''
      }`}
    >
      <span
        className={`nx:text-xs nx:font-medium ${textDark ? 'nx:text-background' : 'nx:text-inherit'}`}
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
      className={`nx:bg-background nx:flex nx:h-16 nx:w-full nx:items-center nx:justify-center nx:rounded-lg ${shadowClass}`}
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
      className={`nx:border-2 nx:border-primary-background nx:bg-muted nx:flex nx:h-14 nx:w-14 nx:items-center nx:justify-center ${className}`}
    >
      <span className="nx:text-xs nx:font-medium">{name}</span>
    </div>
  );
}

function SpacingBar({ name, className }: { name: string; className: string }) {
  return (
    <div className="nx:flex nx:items-center nx:gap-3">
      <span className="nx:text-muted-foreground nx:w-8 nx:text-xs nx:text-right nx:font-mono">
        {name}
      </span>
      <div
        className={`nx:bg-primary-background nx:h-3 nx:rounded-sm ${className}`}
      />
    </div>
  );
}
