// Incremental adoption demo. NO @acme components here — instead the app authors
// the design system's `nx:` utilities DIRECTLY in its own markup, right next to
// its own (unprefixed) Tailwind classes. Works because the nx: theme is loaded
// as a SEPARATE Tailwind entry (app/nexus.css) — its own compilation — so the
// app's Tailwind (globals.css) generates bg-slate-*/flex AND the nx: utilities
// here both resolve, without the prefix collision you'd get from one build.
// Plain Server Component.

export default function IncrementalPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Mixing <code className="rounded bg-slate-100 px-1 text-base">nx:</code> utilities with your own Tailwind
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          The chrome around each block uses the app&apos;s own Tailwind
          (<code>bg-white</code>, <code>text-slate-900</code>, <code>rounded-xl</code>). The
          tinted blocks use the design system&apos;s <code>nx:</code> utilities authored
          inline — same build, one <code>@import</code>, no collision.
        </p>
      </div>

      {/* Authored nx: utilities — these reference the design system's semantic tokens. */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="nx:bg-primary-background nx:text-primary-foreground nx:rounded-lg nx:p-6">
          <p className="nx:typography-label-caps">nx:bg-primary-background</p>
          <p className="nx:typography-body-default nx:mt-1">
            Authored with nx: utilities. Retheme it from the palette control — the
            token updates live.
          </p>
        </div>

        <div className="nx:bg-container nx:text-foreground nx:border nx:border-border-default nx:rounded-lg nx:p-6">
          <p className="nx:typography-label-caps nx:text-muted-foreground">nx:bg-container</p>
          <p className="nx:typography-body-default nx:mt-1">
            A container surface with a semantic border — all from nx: utilities in
            plain app markup.
          </p>
        </div>
      </section>

      {/* Side-by-side: app Tailwind swatch vs nx: token swatch. */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900">
          App Tailwind and nx: tokens, side by side
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="space-y-2">
            <div className="h-14 rounded-lg bg-violet-600" />
            <p className="text-xs text-slate-500">app: bg-violet-600</p>
          </div>
          <div className="space-y-2">
            <div className="h-14 rounded-lg bg-slate-200" />
            <p className="text-xs text-slate-500">app: bg-slate-200</p>
          </div>
          <div className="space-y-2">
            <div className="nx:bg-primary-background h-14 rounded-lg" />
            <p className="text-xs text-slate-500">nx: bg-primary-background</p>
          </div>
          <div className="space-y-2">
            <div className="nx:bg-muted h-14 rounded-lg" />
            <p className="text-xs text-slate-500">nx: bg-muted</p>
          </div>
        </div>
      </section>

      {/* A hand-built button using nx: utilities directly. */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900">A button in nx: utilities</h3>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="nx:bg-primary-background nx:hover:bg-primary-background-hover nx:text-primary-foreground nx:rounded-md nx:h-10 nx:px-4 nx:typography-label-default"
          >
            nx: primary
          </button>
          <button
            type="button"
            className="nx:bg-secondary-background nx:hover:bg-secondary-background-hover nx:text-secondary-foreground nx:rounded-md nx:h-10 nx:px-4 nx:typography-label-default"
          >
            nx: secondary
          </button>
        </div>
      </section>
    </div>
  );
}
