import { SectionHeading } from '../../_components/Heading';

/**
 * Foundations → Layering. Server component — the 6-token z-index scale and the
 * mental model that keeps elevation (shadow) and paint order (z-index) as
 * independent axes. Static spec; the z-index tokens are theme-agnostic, so
 * nothing here reacts to the picker.
 *
 * Source: packages/core/tokens/semantic/z-index.json.
 */

export const description =
  'The nxds z-index scale. Six tokens decide which overlay paints on top, so a select inside a dialog always shows.';

const LAYERS: { token: string; value: number; use: string }[] = [
  { token: 'overlay', value: 10, use: 'Low-level scrims' },
  { token: 'sticky', value: 30, use: 'App-shell chrome, sticky headers' },
  { token: 'modal', value: 50, use: 'Dialog and its backdrop' },
  {
    token: 'popover',
    value: 70,
    use: 'Dropdown / select / tooltip — the floating layer',
  },
  { token: 'toast', value: 100, use: 'Notifications' },
  { token: 'max', value: 9999, use: 'Host system UI' },
];

export default function Layering() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Layering</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Six z-index tokens decide which overlay paints on top. Use one only when
        two positioned layers can overlap.
      </p>

      {/* ── The z-index scale ───────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          The z-index scale
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          From lowest to highest, <code>nx:z-overlay</code> to{' '}
          <code>nx:z-max</code>:
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Token</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Value</th>
                <th className="nx:py-2 nx:font-semibold">Use</th>
              </tr>
            </thead>
            <tbody>
              {LAYERS.map((layer) => (
                <tr
                  key={layer.token}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    nx:z-{layer.token}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    {layer.value}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:typography-label-small">
                    {layer.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Why popover sits above modal ────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Why popover sits above modal
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Popover (70) sits above modal (50) on purpose. A dropdown, select or
          tooltip opened inside a Dialog has to paint above the Dialog. Keep
          popover above modal.
        </p>
      </section>

      {/* ── Shadow vs z-index ───────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Shadow vs z-index
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Shadow makes a surface look raised. z-index decides what paints on
          top. The two are separate, so a higher z-index doesn&rsquo;t mean a
          bigger shadow.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Overlays render at the end of <code>document.body</code>, so one
          overlay already paints above the page. z-index matters when two
          overlays stack, like a select inside a dialog, or when your app has
          its own fixed element.
        </p>
      </section>
    </>
  );
}
