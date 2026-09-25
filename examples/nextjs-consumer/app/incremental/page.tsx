'use client';

// Coexistence lab — every way the app's OWN (unprefixed) Tailwind meets the
// design system's `nx:` utilities in one file: same-element mixing, namespace
// isolation, shared-name scales, the real same-property gotcha, variants, dark
// mode, responsive, grouping, arbitrary values, and authored-vs-component.
//
// Runtime: globals.css (app Tailwind) + app/nexus.css (nx: theme) are SEPARATE
// compilations, so the nx: prefix never clobbers the app's own build. Editor
// autocomplete for both comes from tailwind.intellisense.css (see .vscode).

import { Button } from '@acme/react';
import type { ReactNode } from 'react';

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          <span className="mr-2 text-slate-400">{n}</span>
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{note}</p>
      </div>
      {children}
    </section>
  );
}

// small inline code label
function K({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-700">{children}</code>
  );
}

export default function IncrementalPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Coexistence lab</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          The app&apos;s own Tailwind (<K>bg-slate-*</K>, <K>flex</K>, <K>rounded-xl</K>) and
          the design system&apos;s <K>nx:</K> utilities, mixed every way — including the one
          real gotcha. Nothing here uses a runtime build trick: the <K>nx:</K> theme is just
          a separate Tailwind entry.
        </p>
      </div>

      {/* 1 — same element */}
      <Section
        n="1"
        title="Same element, both worlds"
        note={
          <>App layout utilities and <K>nx:</K> tokens compose on one node.</>
        }
      >
        <div className="nx:bg-primary-background nx:text-primary-foreground flex flex-wrap items-center gap-4 rounded-xl p-6 shadow-sm">
          <span className="rounded-lg bg-white/20 px-3 py-1 font-medium">app: flex gap-4 p-6 rounded-xl</span>
          <span className="nx:typography-body-default">nx: bg-primary-background text-primary-foreground</span>
        </div>
      </Section>

      {/* 2 — namespace isolation */}
      <Section
        n="2"
        title="Namespace isolation — no collision"
        note={
          <>
            Same <em>kind</em> of utility, different namespaces (<K>bg-*</K> vs <K>nx:bg-*</K>,
            <K>--color-*</K> vs <K>--nx-color-*</K>). Both render.
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">app: bg-slate-100</div>
          <div className="nx:bg-container nx:text-foreground rounded-lg p-4 text-sm nx:border nx:border-border-default">
            nx: bg-container
          </div>
          <div className="rounded-lg bg-violet-600 p-4 text-sm text-white">app: bg-violet-600</div>
          <div className="nx:bg-primary-background nx:text-primary-foreground rounded-lg p-4 text-sm">
            nx: bg-primary-background
          </div>
        </div>
      </Section>

      {/* 3 — shared-name scales diverge */}
      <Section
        n="3"
        title="Shared-name scales diverge"
        note={
          <>
            <K>rounded-lg</K>/<K>shadow-lg</K> and <K>nx:rounded-lg</K>/<K>nx:shadow-lg</K> are
            different classes (<K>.rounded-lg</K> vs <K>.nx\:rounded-lg</K>), so they can render
            differently — app default vs design-system scale.
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div className="rounded-lg bg-slate-200 p-6 text-slate-700">app rounded-lg</div>
          <div className="nx:rounded-lg bg-slate-200 p-6 text-slate-700">nx:rounded-lg (DS radius)</div>
          <div className="rounded-none bg-white p-6 text-slate-700 shadow-lg">app shadow-lg</div>
          <div className="nx:shadow-lg rounded-none bg-white p-6 text-slate-700">nx:shadow-lg (DS shadow)</div>
        </div>
      </Section>

      {/* 4 — the real gotcha */}
      <Section
        n="4"
        title="⚠️ Same property on one element — source order wins"
        note={
          <>
            <K>bg-slate-200</K> <strong>and</strong> <K>nx:bg-primary-background</K> on the same
            node both set <K>background-color</K>. The winner is CSS <strong>source order</strong>
            {' '}(which stylesheet loads last), <strong>not</strong> the order you wrote the classes.
          </>
        }
      >
        <div className="nx:bg-primary-background nx:text-primary-foreground rounded-lg bg-slate-200 p-6 text-sm">
          <p className="font-medium">
            className=&quot;… bg-slate-200 nx:bg-primary-background&quot; → renders <em>nx:</em>
          </p>
          <p className="mt-1 opacity-90">
            Here <K>app/nexus.css</K> is imported after <K>globals.css</K>, so the nx: rule comes
            later and wins. Rule of thumb: don&apos;t set the same property from both namespaces on
            one element — pick one.
          </p>
        </div>
      </Section>

      {/* 5 — variants & states */}
      <Section
        n="5"
        title="Variants & states, combined"
        note={
          <>
            App <K>hover:</K> (a transform) + <K>nx:hover:</K> (a token) + the DS focus ring, all on
            one button. Hover it, then Tab to it.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 rounded-md px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
          >
            app hover:-translate-y-0.5 + nx:hover:bg + nx focus ring
          </button>
          <button
            type="button"
            className="nx:active:bg-secondary-background-active rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 active:scale-95"
          >
            app active:scale-95 + nx:active:bg
          </button>
        </div>
      </Section>

      {/* 6 — dark mode */}
      <Section
        n="6"
        title="Dark mode"
        note={
          <>
            The DS toggles dark via the <K>.dark</K> class; this box is wrapped in one, so its{' '}
            <K>nx:</K> tokens flip. (Your app&apos;s own <K>dark:</K> defaults to the OS setting
            unless you point its dark variant at <K>.dark</K> too — align them to share the switch.)
          </>
        }
      >
        <div className="dark nx:bg-background nx:border-border-default overflow-hidden rounded-xl border p-6">
          <p className="nx:text-foreground nx:typography-body-default">
            nx:bg-background + nx:text-foreground under a scoped <K>.dark</K>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="nx:bg-container nx:text-muted-foreground rounded-lg px-3 py-1 text-xs">
              nx:bg-container
            </span>
            <span className="nx:bg-primary-background nx:text-primary-foreground rounded-lg px-3 py-1 text-xs">
              nx:bg-primary-background
            </span>
          </div>
        </div>
      </Section>

      {/* 7 — responsive */}
      <Section
        n="7"
        title="Responsive — matching breakpoints"
        note={
          <>
            App <K>md:</K> and <K>nx:md:</K> fire at the same width (the DS breakpoints equal
            Tailwind&apos;s defaults). Resize past 768px.
          </>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700 md:bg-slate-200">
            app: md:bg-slate-200
          </div>
          <div className="nx:bg-container nx:md:bg-muted rounded-lg p-4 text-sm nx:text-foreground">
            nx: nx:md:bg-muted
          </div>
          <div className="rounded-lg bg-white p-4 text-sm text-slate-500 shadow-sm">
            3-up at md ↔ stacked below
          </div>
        </div>
      </Section>

      {/* 8 — grouping / nesting */}
      <Section
        n="8"
        title="Grouping & nesting"
        note={<>App shell → nested cards that mix nx: surfaces with app chrome, and a setting-row group.</>}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {/* app card, nx: content */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="text-sm font-semibold text-slate-900">App card · nx: rows</h4>
            <div className="mt-3 space-y-2">
              {[
                ['Theme', 'Slate'],
                ['Density', 'Comfortable'],
                ['Radius', 'Square'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="nx:bg-muted flex items-center justify-between rounded-lg p-3"
                >
                  <span className="text-sm text-slate-600">{k}</span>
                  <span className="nx:typography-label-small nx:text-primary-subtle-foreground">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* nx: card, app content */}
          <div className="nx:bg-container nx:border-border-default rounded-xl border p-5">
            <h4 className="nx:typography-heading-xsmall nx:text-foreground">nx: card · app pills</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                app pill
              </span>
              <span className="nx:bg-primary-subtle nx:text-primary-subtle-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                nx pill
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                app pill
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* 9 — arbitrary values */}
      <Section
        n="9"
        title="Arbitrary values"
        note={<>Bracket syntax works in both namespaces, including reading a DS variable directly.</>}
      >
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="rounded-lg bg-[#0ea5e9] p-4 text-white">app: bg-[#0ea5e9]</div>
          <div className="nx:bg-[var(--nx-color-primary-background)] nx:text-primary-foreground rounded-lg p-4">
            nx: bg-[var(--nx-color-primary-background)]
          </div>
          <div className="nx:p-[13px] rounded-lg bg-slate-100 text-slate-700">nx:p-[13px]</div>
        </div>
      </Section>

      {/* 10 — authored vs component */}
      <Section
        n="10"
        title="Authored nx: vs a real component"
        note={<>A hand-authored <K>nx:</K> button next to <K>@acme/react</K>&apos;s <K>&lt;Button&gt;</K> — same tokens, same look.</>}
      >
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover nx:typography-label-default nx:inline-flex nx:h-10 nx:items-center nx:rounded-md nx:px-3.5 nx:transition"
          >
            authored nx: button
          </button>
          <Button>&lt;Button&gt; component</Button>
          <span className="text-sm text-slate-500">↔ visually identical</span>
        </div>
      </Section>
    </div>
  );
}
