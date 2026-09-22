import { CodeSample } from '../../_components/CodeSample';
import { SectionHeading } from '../../_components/Heading';
import { Button, Checkbox, Input, Switch } from '../../_components/nexus';

/**
 * Foundations → Focus. Server component — the focus-ring contract: three
 * recipes, the two-halved field ring, and where the ring deliberately does not
 * go. The specimens are @nexus_ds/react client islands, so Tab actually walks
 * them; the field ring reacts to the picker's Border control because both of
 * its halves read the same borderwidth primitive.
 *
 * Source: packages/react/src/components/{button,input,checkbox}/.
 */

const RECIPES: { name: string; members: string; ring: string }[] = [
  {
    name: 'Control',
    members: 'Checkbox · RadioGroupItem · Switch · Toggle · Tabs trigger',
    ring: 'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
  },
  {
    name: 'Button',
    members: 'Button · every variant',
    ring: 'the control ring + nx:focus-visible:outline-offset-2',
  },
  {
    name: 'Field',
    members:
      'Input · Textarea · NativeSelect · SelectTrigger · MultiSelectTrigger · InputGroup · InputOTPSlot (active slot)',
    ring: 'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default + nx:focus-visible:border-focus-default',
  },
];

const NO_RING: { surface: string; instead: string }[] = [
  {
    surface:
      'Menu and overlay rows — DropdownMenuItem, SelectItem, CommandItem',
    instead: 'nx:focus:bg-popover-hover',
  },
  {
    surface: 'Destructive menu items',
    instead: 'nx:focus:bg-error-background',
  },
  {
    surface: 'Containers — Card, Dialog body, popover surface',
    instead: 'nothing; the ring lives on the focusable children',
  },
];

const TRANSITIONS: { utility: string; properties: string; use: string }[] = [
  {
    utility: 'nx:transition-control',
    properties: 'color, background-color, border-color',
    use: 'Controls — the border is decoration, so it may fade. Button adds scale to the same list',
  },
  {
    utility: 'nx:transition-field',
    properties: 'color, background-color',
    use: 'Field surfaces — the border is half the ring, so it must not fade',
  },
];

export default function Focus() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Focus</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Every keyboard-reachable control paints the same ring: a real CSS{' '}
        <code>outline</code> in the <code>focus-default</code> colour, shown
        only for <code>:focus-visible</code>. Nothing is painted with{' '}
        <code>box-shadow</code>, so the ring follows the corner radius, never
        changes the box size, and never tints the surface underneath it. Tab
        through the specimens below.
      </p>

      {/* ── The three recipes ───────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          The three recipes
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Which recipe a component takes depends on what it <em>is</em>, not on
          whether it happens to have a border. Checkbox and RadioGroupItem carry
          real borders and still take the control recipe — the border is their
          own decoration, not part of the ring.
        </p>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-6 nx:mb-6">
          <Checkbox aria-label="Control recipe specimen" defaultChecked />
          <Switch aria-label="Control recipe specimen" defaultChecked />
          <Button>Button recipe</Button>
          <Input
            aria-label="Field recipe specimen"
            className="nx:w-48"
            defaultValue="Field recipe"
          />
        </div>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[560px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Recipe</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Members</th>
                <th className="nx:py-2 nx:font-semibold">Ring</th>
              </tr>
            </thead>
            <tbody>
              {RECIPES.map((recipe) => (
                <tr
                  key={recipe.name}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:typography-label-small">
                    {recipe.name}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:text-muted-foreground nx:typography-label-small">
                    {recipe.members}
                  </td>
                  <td className="nx:py-2 nx:font-mono nx:text-muted-foreground nx:typography-label-small">
                    {recipe.ring}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── The field ring is two halves ────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          A field ring is two halves
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          A field already has a border, so on focus that border recolours and
          becomes the ring&rsquo;s inner half; the outline adds the outer half.{' '}
          <code>outline-default</code> is the outline-width twin of{' '}
          <code>border-default</code> — both are seeded from the same
          borderwidth primitive — so swapping the picker&rsquo;s Border control
          scales the whole ring instead of thickening only the inside of it. The
          field keeps its border width at rest and focused, so focus never moves
          the text.
        </p>
        <CodeSample lang="tsx">
          {`nx:border-default nx:border-border-default
nx:focus-visible:outline-default nx:focus-visible:outline-focus-default
nx:focus-visible:border-focus-default
nx:disabled:border-border-disabled`}
        </CodeSample>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-4 nx:mb-4 nx:max-w-[64ch]">
          <code>InputOTPSlot</code> takes the same two halves under{' '}
          <code>data-[active=true]:</code> rather than{' '}
          <code>focus-visible:</code>: one transparent input sits over the
          slots, so the ring marks the slot the caret is in, on any focus. It
          has no error state. Slots overlap their full borders by one border
          width, so the active slot recolours all four of its sides without
          moving the row.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-4 nx:mb-4 nx:max-w-[64ch]">
          An invalid field wires an always-on error border plus an
          error-coloured ring on <em>both</em> properties. Tab into the field
          below to see it.
        </p>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-6 nx:mb-4">
          <Input
            aria-invalid
            aria-label="Invalid field specimen"
            className="nx:w-48"
            defaultValue="Invalid value"
          />
        </div>
        <CodeSample lang="tsx">
          {`nx:aria-invalid:border-border-error
nx:aria-invalid:focus-visible:outline-focus-error
nx:aria-invalid:focus-visible:border-focus-error`}
        </CodeSample>
      </section>

      {/* ── One colour ──────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          One colour for every control
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Primary, secondary, outline, ghost, destructive — they all focus in{' '}
          <code>focus-default</code>. Focus is a system signal (&ldquo;you are
          here&rdquo;), not a per-variant or status signal, so there is no
          per-variant focus colour. <code>focus-default</code> resolves to the
          active brand&rsquo;s <code>primary.subtle-foreground</code>, which is
          why the ring re-tints with the theme picker and component code never
          needs a brand-specific focus class. Only the error state differs, and
          it has its own token: <code>focus-error</code>.
        </p>
      </section>

      {/* ── Where the ring does not go ──────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Where the ring does not go
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          The dividing line is input modality. Anything a keyboard user reaches
          with Tab gets the ring. Menu rows do not: Radix roving focus moves DOM
          focus to the row under the pointer, so a ring would flash for mouse
          users while giving them no steady indicator. Those rows tint from the
          surface they sit on instead.
        </p>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Surface</th>
                <th className="nx:py-2 nx:font-semibold">Instead</th>
              </tr>
            </thead>
            <tbody>
              {NO_RING.map((row) => (
                <tr
                  key={row.surface}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:typography-label-small">
                    {row.surface}
                  </td>
                  <td className="nx:py-2 nx:font-mono nx:text-muted-foreground nx:typography-label-small">
                    {row.instead}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Authoring a ring ────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Two rules when you author one
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          <strong className="nx:text-foreground">
            Never pair <code>nx:outline-none</code> with a focus-outline class
            on the same element.
          </strong>{' '}
          Tailwind&rsquo;s <code>outline-none</code> sets{' '}
          <code>--tw-outline-style: none</code>, and{' '}
          <code>outline-&lt;n&gt;</code> emits{' '}
          <code>outline-style: var(--tw-outline-style)</code> — so the ring
          silently never paints. To suppress a nested control&rsquo;s own ring,
          scope the suppression to the variant instead:{' '}
          <code>nx:focus-visible:outline-none</code>.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-[64ch]">
          <strong className="nx:text-foreground">
            Never use <code>nx:transition-colors</code> on a surface that paints
            a ring.
          </strong>{' '}
          Tailwind expands it to a list that includes <code>outline-color</code>
          , so the ring fades in over the duration instead of landing with the
          keypress. <code>pnpm lint</code> fails the pair wherever both land in
          one class string or one <code>cva()</code> / <code>cn()</code> call;
          two strings that only meet somewhere else pass, and the specimens on
          these docs pages are the one surface the check skips. Nexus ships the
          two ring-safe replacements — reach for those instead:
        </p>
        <div className="nx:overflow-x-auto nx:mt-4">
          <table className="nx:w-full nx:min-w-[480px] nx:border-collapse nx:typography-label-default">
            <thead>
              <tr className="nx:border-b nx:border-border-default nx:text-left">
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">Utility</th>
                <th className="nx:py-2 nx:pr-3 nx:font-semibold">
                  Transitions
                </th>
                <th className="nx:py-2 nx:font-semibold">Use on</th>
              </tr>
            </thead>
            <tbody>
              {TRANSITIONS.map((row) => (
                <tr
                  key={row.utility}
                  className="nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:typography-label-small">
                    {row.utility}
                  </td>
                  <td className="nx:py-2 nx:pr-3 nx:font-mono nx:text-muted-foreground nx:typography-label-small">
                    {row.properties}
                  </td>
                  <td className="nx:py-2 nx:text-muted-foreground nx:typography-label-small">
                    {row.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
