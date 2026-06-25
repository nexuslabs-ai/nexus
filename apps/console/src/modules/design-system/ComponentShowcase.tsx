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
    <section className="nx:bg-container nx:rounded-xl nx:border nx:border-border-default nx:overflow-hidden">
      <div className="nx:px-5 nx:py-4 nx:border-b nx:border-border-default nx:bg-background-hover-alpha">
        <h2 className="nx:typography-heading-xsmall nx:text-foreground">
          {title}
        </h2>
        {description && (
          <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-0.5">
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
    <div className="nx:bg-background-hover-alpha nx:min-h-svh">
      <div className="nx:p-6 nx:space-y-6">
        <Section title="Typography" description="Text styles and font scales">
          <div className="nx:space-y-6">
            <div className="nx:space-y-2">
              <span className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase">
                Headings
              </span>
              <div className="nx:space-y-1">
                <p className="nx:typography-heading-large">Heading Large</p>
                <p className="nx:typography-heading-medium">Heading Medium</p>
                <p className="nx:typography-heading-small">Heading Small</p>
                <p className="nx:typography-heading-xsmall">Heading XSmall</p>
              </div>
            </div>

            <div className="nx:space-y-2">
              <span className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase">
                Body
              </span>
              <div className="nx:space-y-2">
                <p className="nx:typography-body-default">
                  Body Default - The quick brown fox jumps over the lazy dog.
                </p>
                <p className="nx:typography-body-small">
                  Body Small - The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>

            <div className="nx:grid nx:grid-cols-2 nx:gap-6">
              <div className="nx:space-y-2">
                <span className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase">
                  Labels
                </span>
                <div className="nx:flex nx:flex-wrap nx:gap-4">
                  <span className="nx:typography-label-default">
                    Label Default
                  </span>
                  <span className="nx:typography-label-small">Label Small</span>
                  <span className="nx:typography-label-caps">Label Caps</span>
                </div>
              </div>
              <div className="nx:space-y-2">
                <span className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase">
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
          description="Brand, status, and control color palette"
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
            <ColorSwatch
              name="Muted Foreground Subtle"
              className="nx:bg-muted-foreground-subtle"
            />
            <ColorSwatch
              name="Control Background"
              className="nx:bg-control-background"
            />
            <ColorSwatch
              name="Control Hover"
              className="nx:bg-control-background-hover"
            />
            <ColorSwatch
              name="Control Thumb"
              className="nx:bg-control-thumb"
              border
            />
            <ColorSwatch name="Success" className="nx:bg-success-background" />
            <ColorSwatch name="Error" className="nx:bg-error-background" />
            <ColorSwatch name="Warning" className="nx:bg-warning-background" />
            <ColorSwatch name="Info" className="nx:bg-information-background" />
          </div>
        </Section>

        {/* Navigation Section */}
        <Section
          title="Navigation"
          description="Sidebar/topbar chrome surface tokens"
        >
          <div className="nx:grid nx:grid-cols-2 nx:gap-4 nx:sm:grid-cols-3 nx:md:grid-cols-6">
            <ColorSwatch
              name="Nav Background"
              className="nx:bg-nav-background"
              border
            />
            <ColorSwatch
              name="Nav Foreground"
              className="nx:bg-nav-foreground"
              textDark
            />
            <ColorSwatch
              name="Nav Muted Fg"
              className="nx:bg-nav-muted-foreground"
            />
            <ColorSwatch
              name="Nav Item Hover"
              className="nx:bg-nav-item-hover"
            />
            <ColorSwatch
              name="Nav Item Active"
              className="nx:bg-nav-item-active"
            />
            <ColorSwatch name="Nav Border" className="nx:bg-nav-border" />
          </div>
          <div className="nx:mt-4 nx:bg-nav-background nx:border nx:border-nav-border nx:rounded-md nx:p-4">
            <p className="nx:text-nav-foreground nx:typography-label-default">
              Nav item label
            </p>
            <p className="nx:text-nav-muted-foreground nx:typography-label-small nx:mt-1">
              Nav muted helper text
            </p>
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

        {/* Role Utilities Section */}
        <Section
          title="Role Utilities"
          description="Per-mode tokens that drive component-internal spacing — switch the Spacing axis to see them flex"
        >
          <div className="nx:space-y-6">
            {/* Container */}
            <div className="nx:space-y-2">
              <span className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase">
                Container — p-container, gap-container
              </span>
              <div className="nx:bg-container nx:border nx:border-border-default nx:rounded-lg nx:flex nx:flex-col nx:p-container nx:gap-container">
                <h4 className="nx:text-foreground nx:font-medium">
                  Card header
                </h4>
                <p className="nx:typography-body-default nx:text-muted-foreground">
                  Card body — interior padding and the gap between siblings both
                  scale with the active Spacing mode.
                </p>
                <div className="nx:flex nx:flex-wrap nx:gap-2">
                  <button className="nx:bg-primary-background nx:text-primary-foreground nx:rounded-md nx:px-3 nx:py-1.5 nx:typography-label-default">
                    Confirm
                  </button>
                  <button className="nx:border nx:border-border-default nx:bg-background nx:rounded-md nx:px-3 nx:py-1.5 nx:typography-label-default">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Layout */}
            <div className="nx:space-y-2">
              <span className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase">
                Layout — gap-layout-section, gap-layout-stack
              </span>
              <div className="nx:flex nx:flex-col nx:gap-layout-section nx:bg-muted nx:rounded-lg nx:p-4">
                {['Section A', 'Section B'].map((label) => (
                  <div
                    key={label}
                    className="nx:flex nx:flex-col nx:gap-layout-stack"
                  >
                    <span className="nx:typography-label-small nx:font-semibold nx:text-foreground">
                      {label}
                    </span>
                    <span className="nx:typography-label-default nx:text-muted-foreground">
                      Stack item one
                    </span>
                    <span className="nx:typography-label-default nx:text-muted-foreground">
                      Stack item two
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Icons Section */}
        <IconShowcase />

        {/* Buttons Section */}
        <Section title="Buttons" description="Interactive button variants">
          <div className="nx:space-y-4">
            <div className="nx:flex nx:flex-wrap nx:gap-3">
              <button className="nx:bg-primary-background nx:text-primary-foreground nx:rounded-md nx:px-4 nx:py-2 nx:typography-label-default nx:hover:opacity-90 nx:transition-opacity">
                Primary
              </button>
              <button className="nx:bg-secondary-background nx:text-secondary-foreground nx:rounded-md nx:px-4 nx:py-2 nx:typography-label-default nx:hover:opacity-90 nx:transition-opacity">
                Secondary
              </button>
              <button className="nx:border nx:border-border-default nx:bg-background nx:hover:bg-background-hover nx:rounded-md nx:px-4 nx:py-2 nx:typography-label-default nx:transition-colors">
                Outline
              </button>
              <button className="nx:hover:bg-background-hover nx:rounded-md nx:px-4 nx:py-2 nx:typography-label-default nx:transition-colors">
                Ghost
              </button>
              <button className="nx:bg-error-background nx:text-error-foreground nx:rounded-md nx:px-4 nx:py-2 nx:typography-label-default nx:hover:opacity-90 nx:transition-opacity">
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
              <p className="nx:text-muted-foreground nx:mt-1 nx:typography-body-default">
                Default container background
              </p>
            </div>
            <div className="nx:border nx:border-border-default nx:bg-popover nx:rounded-lg nx:p-4">
              <h3 className="nx:font-medium">Popover</h3>
              <p className="nx:text-muted-foreground nx:mt-1 nx:typography-body-default">
                Popover background color
              </p>
            </div>
            <div className="nx:bg-muted nx:rounded-lg nx:p-4">
              <h3 className="nx:text-muted-foreground nx:font-medium">Muted</h3>
              <p className="nx:text-muted-foreground nx:mt-1 nx:typography-body-default">
                Muted background with muted foreground
              </p>
            </div>
            <div className="nx:bg-background-hover nx:rounded-lg nx:p-4">
              <h3 className="nx:text-foreground nx:font-medium">
                Background Hover
              </h3>
              <p className="nx:text-muted-foreground nx:mt-1 nx:typography-body-default">
                Hover-state background color
              </p>
            </div>
          </div>
        </Section>

        {/* Borders Section */}
        <Section title="Borders" description="Border widths and colors">
          <div className="nx:space-y-4">
            <div>
              <span className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase">
                Width
              </span>
              <div className="nx:flex nx:flex-wrap nx:gap-3 nx:mt-2">
                <div className="nx:border nx:border-border-default nx:border-default nx:rounded nx:px-4 nx:py-2 nx:typography-label-default">
                  default
                </div>
                <div className="nx:border nx:border-border-default nx:border-thick nx:rounded nx:px-4 nx:py-2 nx:typography-label-default">
                  thick
                </div>
              </div>
            </div>
            <div>
              <span className="nx:typography-label-caps nx:text-muted-foreground nx:uppercase">
                Colors
              </span>
              <div className="nx:flex nx:flex-wrap nx:gap-3 nx:mt-2">
                <div className="nx:border-2 nx:border-border-default nx:rounded nx:px-4 nx:py-2 nx:typography-label-default">
                  Default
                </div>
                <div className="nx:border-2 nx:border-border-primary nx:rounded nx:px-4 nx:py-2 nx:typography-label-default">
                  Primary
                </div>
                <div className="nx:border-2 nx:border-border-success nx:rounded nx:px-4 nx:py-2 nx:typography-label-default">
                  Success
                </div>
                <div className="nx:border-2 nx:border-border-error nx:rounded nx:px-4 nx:py-2 nx:typography-label-default">
                  Error
                </div>
                <div className="nx:border-2 nx:border-border-information nx:rounded nx:px-4 nx:py-2 nx:typography-label-default">
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
            <div className="nx:bg-success-subtle nx:border nx:border-border-success nx:rounded-lg nx:p-4 nx:flex nx:items-center nx:gap-3">
              <div className="nx:w-2 nx:h-2 nx:rounded-full nx:bg-success-background" />
              <span className="nx:text-success-subtle-foreground nx:typography-label-default">
                Success message
              </span>
            </div>
            <div className="nx:bg-error-subtle nx:border nx:border-border-error nx:rounded-lg nx:p-4 nx:flex nx:items-center nx:gap-3">
              <div className="nx:w-2 nx:h-2 nx:rounded-full nx:bg-error-background" />
              <span className="nx:text-error-subtle-foreground nx:typography-label-default">
                Error message
              </span>
            </div>
            <div className="nx:bg-warning-subtle nx:border nx:border-border-warning nx:rounded-lg nx:p-4 nx:flex nx:items-center nx:gap-3">
              <div className="nx:w-2 nx:h-2 nx:rounded-full nx:bg-warning-background" />
              <span className="nx:text-warning-subtle-foreground nx:typography-label-default">
                Warning message
              </span>
            </div>
            <div className="nx:bg-information-subtle nx:border nx:border-border-information nx:rounded-lg nx:p-4 nx:flex nx:items-center nx:gap-3">
              <div className="nx:w-2 nx:h-2 nx:rounded-full nx:bg-information-background" />
              <span className="nx:text-information-subtle-foreground nx:typography-label-default">
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
        className={`nx:typography-label-small ${textDark ? 'nx:text-background' : 'nx:text-inherit'}`}
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
      <span className="nx:text-muted-foreground nx:typography-label-small">
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
      <span className="nx:typography-label-small">{name}</span>
    </div>
  );
}

function SpacingBar({ name, className }: { name: string; className: string }) {
  return (
    <div className="nx:flex nx:items-center nx:gap-3">
      <span className="nx:text-muted-foreground nx:w-8 nx:typography-label-small nx:text-right nx:font-mono">
        {name}
      </span>
      <div
        className={`nx:bg-primary-background nx:h-3 nx:rounded-sm ${className}`}
      />
    </div>
  );
}
