import { Breadcrumb } from '../_components/Breadcrumb';

/**
 * Foundations → Layering. Server component — the 6-token z-index scale and the
 * mental model that keeps elevation (shadow) and paint order (z-index) as
 * independent axes. Static spec; the z-index tokens are theme-agnostic, so
 * nothing here reacts to the picker.
 *
 * Source: .claude/rules/components.md § Layering model.
 */

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

export function Layering() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Foundations', href: '/foundations' },
          { label: 'Layering' },
        ]}
      />
      <h1 className="nx:typography-heading-large">Layering</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        A 6-token z-index scale for stacking overlays. Shadow communicates{' '}
        <em>perceived elevation</em>; z-index controls{' '}
        <em>actual paint order</em>. They are independent axes — a higher
        z-index does not imply a larger shadow, and the elevation shadows never
        set stacking. Reach for a z-index token only when two positioned layers
        can overlap.
      </p>

      {/* ── The z-index scale ───────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">
          The z-index scale
        </h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Six tokens, low to high. Utilities run <code>nx:z-overlay</code>{' '}
          through <code>nx:z-max</code>.
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
        <h2 className="nx:typography-heading-small nx:mb-1">
          Why popover sits above modal
        </h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Popover (70) outranks modal (50) by design. A dropdown, select, or
          tooltip opened <em>inside</em> a Dialog must paint above the dialog to
          stay usable — so the floating-layer token deliberately sits above the
          modal layer. This is the non-obvious ordering; do not
          &ldquo;fix&rdquo; it by dropping popover below modal.
        </p>
      </section>

      {/* ── Shadow vs z-index ───────────────────────────────── */}
      <section className="nx:mb-12">
        <h2 className="nx:typography-heading-small nx:mb-1">
          Shadow vs z-index
        </h2>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Shadow is perceived elevation; z-index is paint order. They are
          independent — reach for a z-index token only when two positioned
          layers can actually overlap. Radix portals append their content to{' '}
          <code>document.body</code>, so a single overlay paints above page
          content in DOM order on its own; z-index becomes load-bearing when two
          overlay types stack (a select opened inside a dialog) or a consumer
          ships a competing fixed element.
        </p>
      </section>
    </>
  );
}
