export function ComponentShowcase() {
  return (
    <div className="space-y-8 p-8">
      {/* Buttons Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-md bg-primary-background px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Primary
          </button>
          <button className="rounded-md bg-secondary-background px-4 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90">
            Secondary
          </button>
          <button className="rounded-md border border-border-default bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Outline
          </button>
          <button className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent">
            Ghost
          </button>
          <button className="rounded-md bg-error-background px-4 py-2 text-sm font-medium text-error-foreground hover:opacity-90">
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
          <div className="rounded-lg border border-border-default bg-container p-4">
            <h3 className="font-medium">Container</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This is a container with default background
            </p>
          </div>
          <div className="rounded-lg border border-border-default bg-popover p-4">
            <h3 className="font-medium">Popover</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This uses the popover background color
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-medium text-muted-foreground">Muted</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Muted background with muted foreground text
            </p>
          </div>
          <div className="rounded-lg bg-accent p-4">
            <h3 className="font-medium text-accent-foreground">Accent</h3>
            <p className="mt-1 text-sm text-accent-foreground">
              Accent background with accent foreground text
            </p>
          </div>
        </div>
      </section>

      {/* Borders Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Borders</h2>
        <div className="flex flex-wrap gap-3">
          <div className="rounded border-2 border-border-default px-4 py-2">Default</div>
          <div className="rounded border-2 border-border-primary px-4 py-2">Primary</div>
          <div className="rounded border-2 border-border-success px-4 py-2">Success</div>
          <div className="rounded border-2 border-border-error px-4 py-2">Error</div>
          <div className="rounded border-2 border-border-information px-4 py-2">Info</div>
        </div>
      </section>

      {/* Status Colors Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Status Colors</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-success-surface p-4">
            <span className="text-sm font-medium text-success-text">Success message</span>
          </div>
          <div className="rounded-lg bg-error-surface p-4">
            <span className="text-sm font-medium text-error-text">Error message</span>
          </div>
          <div className="rounded-lg bg-warning-surface p-4">
            <span className="text-sm font-medium text-warning-text">Warning message</span>
          </div>
          <div className="rounded-lg bg-information-surface p-4">
            <span className="text-sm font-medium text-information-text">Info message</span>
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
      className={`flex h-20 items-end rounded-lg border border-border-default p-2 ${className}`}
    >
      <span className={`text-xs font-medium ${textDark ? 'text-background' : ''}`}>{name}</span>
    </div>
  );
}
