export function ComponentShowcase() {
  return (
    <div className="space-y-8 p-8">
      {/* Typography Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Typography</h2>
        <div className="border-border-default bg-container space-y-4 rounded-lg border p-4">
          <div>
            <span className="text-muted-foreground text-xs">display-large</span>
            <p className="text-display-large">Display Large</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">
              display-medium
            </span>
            <p className="text-display-medium">Display Medium</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">
              heading-xlarge
            </span>
            <p className="text-heading-xlarge">Heading XLarge</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">heading-large</span>
            <p className="text-heading-large">Heading Large</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">
              heading-medium
            </span>
            <p className="text-heading-medium">Heading Medium</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">body-large</span>
            <p className="text-body-large">
              Body Large - The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">body-default</span>
            <p className="text-body-default">
              Body Default - The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">body-small</span>
            <p className="text-body-small">
              Body Small - The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-muted-foreground text-xs">label-large</span>
              <p className="text-label-large">Label Large</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">
                label-default
              </span>
              <p className="text-label-default">Label Default</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">label-small</span>
              <p className="text-label-small">Label Small</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">label-caps</span>
              <p className="text-label-caps">Label Caps</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-muted-foreground text-xs">code-block</span>
              <p className="text-code-block">const x = 42;</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">code-inline</span>
              <p className="text-code-inline">inline code</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shadows Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Shadows</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <ShadowBox name="2xs" shadowClass="shadow-2xs" />
          <ShadowBox name="xs" shadowClass="shadow-xs" />
          <ShadowBox name="sm" shadowClass="shadow-sm" />
          <ShadowBox name="base" shadowClass="shadow-base" />
          <ShadowBox name="lg" shadowClass="shadow-lg" />
          <ShadowBox name="xl" shadowClass="shadow-xl" />
          <ShadowBox name="2xl" shadowClass="shadow-2xl" />
          <ShadowBox name="inner" shadowClass="shadow-inner" />
          <ShadowBox name="focus" shadowClass="shadow-focus-default" />
        </div>
      </section>

      {/* Radius Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Border Radius</h2>
        <div className="flex flex-wrap gap-4">
          <RadiusBox name="base" className="rounded-base" />
          <RadiusBox name="sm" className="rounded-sm" />
          <RadiusBox name="md" className="rounded-md" />
          <RadiusBox name="lg" className="rounded-lg" />
          <RadiusBox name="xl" className="rounded-xl" />
          <RadiusBox name="2xl" className="rounded-2xl" />
          <RadiusBox name="3xl" className="rounded-3xl" />
          <RadiusBox name="full" className="rounded-full" />
        </div>
      </section>

      {/* Spacing Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Spacing Scale</h2>
        <div className="space-y-2">
          <SpacingBar name="w-1" className="w-1" />
          <SpacingBar name="w-2" className="w-2" />
          <SpacingBar name="w-3" className="w-3" />
          <SpacingBar name="w-4" className="w-4" />
          <SpacingBar name="w-5" className="w-5" />
          <SpacingBar name="w-6" className="w-6" />
          <SpacingBar name="w-8" className="w-8" />
          <SpacingBar name="w-10" className="w-10" />
          <SpacingBar name="w-12" className="w-12" />
          <SpacingBar name="w-16" className="w-16" />
        </div>
      </section>

      {/* Buttons Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button className="bg-primary-background text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90">
            Primary
          </button>
          <button className="bg-secondary-background text-secondary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90">
            Secondary
          </button>
          <button className="border-border-default bg-background hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium">
            Outline
          </button>
          <button className="hover:bg-accent rounded-md px-4 py-2 text-sm font-medium">
            Ghost
          </button>
          <button className="bg-error-background text-error-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90">
            Destructive
          </button>
        </div>
      </section>

      {/* Color Swatches Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Semantic Colors</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <ColorSwatch name="Background" className="bg-background" />
          <ColorSwatch name="Foreground" className="bg-foreground" textDark />
          <ColorSwatch name="Primary" className="bg-primary-background" />
          <ColorSwatch name="Secondary" className="bg-secondary-background" />
          <ColorSwatch name="Muted" className="bg-muted" />
          <ColorSwatch name="Accent" className="bg-accent" />
          <ColorSwatch name="Success" className="bg-success-background" />
          <ColorSwatch name="Error" className="bg-error-background" />
          <ColorSwatch name="Warning" className="bg-warning-background" />
          <ColorSwatch name="Info" className="bg-information-background" />
        </div>
      </section>

      {/* Cards Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Cards & Containers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border-border-default bg-container rounded-lg border p-4">
            <h3 className="font-medium">Container</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              This is a container with default background
            </p>
          </div>
          <div className="border-border-default bg-popover rounded-lg border p-4">
            <h3 className="font-medium">Popover</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              This uses the popover background color
            </p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-muted-foreground font-medium">Muted</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Muted background with muted foreground text
            </p>
          </div>
          <div className="bg-accent rounded-lg p-4">
            <h3 className="text-accent-foreground font-medium">Accent</h3>
            <p className="text-accent-foreground mt-1 text-sm">
              Accent background with accent foreground text
            </p>
          </div>
        </div>
      </section>

      {/* Borders Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Borders</h2>
        <div className="space-y-4">
          <div>
            <span className="text-muted-foreground mb-2 block text-xs">
              Border Width Utilities
            </span>
            <div className="flex flex-wrap gap-3">
              <div className="border-border-default border-default rounded px-4 py-2">
                border-default
              </div>
              <div className="border-border-default border-thick rounded px-4 py-2">
                border-thick
              </div>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground mb-2 block text-xs">
              Border Colors
            </span>
            <div className="flex flex-wrap gap-3">
              <div className="border-border-default border-thick rounded px-4 py-2">
                Default
              </div>
              <div className="border-border-primary border-thick rounded px-4 py-2">
                Primary
              </div>
              <div className="border-border-success border-thick rounded px-4 py-2">
                Success
              </div>
              <div className="border-border-error border-thick rounded px-4 py-2">
                Error
              </div>
              <div className="border-border-information border-thick rounded px-4 py-2">
                Info
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Colors Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Status Colors</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-success-surface rounded-lg p-4">
            <span className="text-success-text text-sm font-medium">
              Success message
            </span>
          </div>
          <div className="bg-error-surface rounded-lg p-4">
            <span className="text-error-text text-sm font-medium">
              Error message
            </span>
          </div>
          <div className="bg-warning-surface rounded-lg p-4">
            <span className="text-warning-text text-sm font-medium">
              Warning message
            </span>
          </div>
          <div className="bg-information-surface rounded-lg p-4">
            <span className="text-information-text text-sm font-medium">
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
      className={`border-border-default flex h-20 items-end rounded-lg border p-2 ${className}`}
    >
      <span
        className={`text-xs font-medium ${textDark ? 'text-background' : ''}`}
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
      className={`bg-container flex h-20 w-full items-center justify-center rounded-lg ${shadowClass}`}
    >
      <span className="text-muted-foreground text-xs font-medium">{name}</span>
    </div>
  );
}

function RadiusBox({ name, className }: { name: string; className: string }) {
  return (
    <div
      className={`border-primary-background bg-container flex h-16 w-16 items-center justify-center border-2 ${className}`}
    >
      <span className="text-xs font-medium">{name}</span>
    </div>
  );
}

function SpacingBar({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground w-12 text-xs">{name}</span>
      <div className={`bg-primary-background h-4 ${className}`} />
    </div>
  );
}
