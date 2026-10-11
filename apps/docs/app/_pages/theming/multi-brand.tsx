import Link from 'next/link';

import { CodeSample } from '../../_components/CodeSample';
import { SectionHeading } from '../../_components/Heading';
import { Button } from '../../_components/nexus';

/**
 * Theming → Multi-brand. Server component; the live preview renders
 * @nexus_ds/react Buttons as a client island that re-themes via the picker.
 *
 * Sources: packages/core/src/lib/appearance-model.ts, packages/tailwind/nexus.css.
 */

const SETTINGS: { field: string; sets: string; appliedAs: string }[] = [
  { field: 'brandColor', sets: 'Primary color', appliedAs: 'CSS variables' },
  { field: 'surfaceTone', sets: 'Background gray', appliedAs: 'CSS variables' },
  { field: 'mode', sets: 'Light or dark', appliedAs: '.dark class' },
  { field: 'density', sets: 'Spacing', appliedAs: 'data-density' },
  { field: 'corners', sets: 'Corner radius', appliedAs: 'data-radius' },
  { field: 'elevation', sets: 'Shadows', appliedAs: 'data-shadow' },
  { field: 'stroke', sets: 'Border width', appliedAs: 'data-borderwidth' },
];

const SWITCH_SAMPLE = `const { setState } = useNexusAppearance();

setState((current) => ({ ...current, brandColor: '#7c3aed' }));`;

const SCOPE_SAMPLE = `<section data-density="compact" data-radius="round">
  {/* everything here is compact and rounded */}
</section>`;

const SWATCHES = [
  'primary-background',
  'secondary-background',
  'muted',
  'foreground',
];

export default function MultiBrand() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Multi-brand theming</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Change any part of the theme at runtime, without a rebuild. Components
        only use tokens, so one change restyles every component at once.
      </p>

      {/* ── Settings ────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          What you can change
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Each setting is a field in
          <Link
            href="/theming/appearance"
            className="nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2"
          >
            Appearance
          </Link>
          . The provider applies it to <code>&lt;html&gt;</code>:
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Field</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Sets</th>
                <th className="nx:py-2 nx:font-semibold">Applied as</th>
              </tr>
            </thead>
            <tbody>
              {SETTINGS.map((s) => (
                <tr
                  key={s.field}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    {s.field}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground">
                    {s.sets}
                  </td>
                  <td className="nx:py-2 nx:font-mono nx:typography-label-small nx:text-muted-foreground">
                    {s.appliedAs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Live ────────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          See it live
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Change Base in the theme picker in the bottom-right corner. These
          buttons and swatches update at once.
        </p>
        <div
          data-md-skip
          className="nx:flex nx:flex-wrap nx:items-center nx:gap-3 nx:rounded-xl nx:border nx:border-border-default nx:bg-container nx:p-5"
        >
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <span className="nx:ml-1 nx:flex nx:gap-1.5">
            {SWATCHES.map((token) => (
              <span
                key={token}
                title={token}
                className="nx:size-8 nx:rounded-md nx:border nx:border-border-default"
                style={{ background: `var(--nx-color-${token})` }}
              />
            ))}
          </span>
        </div>
      </section>

      {/* ── Switch brands ───────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Switch brands
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          To switch brands, set <code>brandColor</code> with
          <code>useNexusAppearance</code>. Nexus builds the new palette and
          applies it to the whole app:
        </p>
        <CodeSample lang="tsx">{SWITCH_SAMPLE}</CodeSample>
      </section>

      {/* ── Scope ───────────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Change one part of the page
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Put <code>data-density</code> or <code>data-radius</code> on any
          element. Everything inside it uses that setting:
        </p>
        <CodeSample lang="tsx">{SCOPE_SAMPLE}</CodeSample>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-4 nx:max-w-[64ch]">
          Brand color and mode apply to the whole app. For finer control over
          corners, see{' '}
          <Link
            href="/theming/radius-overrides"
            className="nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2"
          >
            Radius overrides
          </Link>
          .
        </p>
      </section>
    </>
  );
}
