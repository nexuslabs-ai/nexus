import { CodeSample } from '../../_components/CodeSample';
import { SectionHeading } from '../../_components/Heading';
import { Button, Checkbox, Input, Switch } from '../../_components/nexus';

/**
 * Foundations → Focus. Server component — the focus-ring contract: three
 * recipes, the two-halved field ring, and where the ring deliberately does not
 * go. The specimens are @nexus_ds/react client islands, so Tab actually walks
 * them; the field ring reacts to the picker's Border Width control because both of
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
    surface: 'Menu rows: DropdownMenuItem, SelectItem, CommandItem',
    instead: 'nx:focus:bg-popover-hover',
  },
  {
    surface: 'Destructive menu items',
    instead: 'nx:focus:bg-error-background',
  },
  {
    surface: 'Containers — Card, Dialog body, popover surface',
    instead: 'No ring. The controls inside get it.',
  },
];

const TRANSITIONS: { utility: string; properties: string; use: string }[] = [
  {
    utility: 'nx:transition-control',
    properties: 'color, background-color, border-color',
    use: 'Controls. Button also transitions scale.',
  },
  {
    utility: 'nx:transition-field',
    properties: 'color, background-color',
    use: 'Fields. The border is half the ring, so it must not fade.',
  },
];

export default function Focus() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Focus</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-4 nx:max-w-[64ch]">
        Every control reachable with Tab shows the same focus ring. The ring is
        a CSS <code>outline</code> in the <code>focus-default</code> color,
        shown on <code>:focus-visible</code>.
      </p>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-8 nx:max-w-[64ch]">
        The ring follows the corner radius and never changes the control&rsquo;s
        size. Press Tab to move through the examples on this page.
      </p>

      {/* ── The three recipes ───────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          The three recipes
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Each component uses one of three ring recipes (a fixed set of focus
          classes), based on what kind of control it is. Checkbox and
          RadioGroupItem use the control recipe. Their border is decoration, not
          part of the ring.
        </p>
        <div
          data-md-skip
          className="nx:flex nx:flex-wrap nx:items-center nx:gap-6 nx:mb-6"
        >
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
          On focus, a field&rsquo;s border changes color and forms the inner
          half of the ring. The outline adds the outer half.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          <code>outline-default</code> and <code>border-default</code> share one
          width, so the whole ring scales with <code>stroke</code> (Border Width
          in the theme picker). The border width doesn&rsquo;t change on focus,
          so the text never moves.
        </p>
        <CodeSample lang="tsx">
          {`nx:border-default nx:border-border-default
nx:focus-visible:outline-default nx:focus-visible:outline-focus-default
nx:focus-visible:border-focus-default
nx:disabled:border-border-disabled`}
        </CodeSample>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-4 nx:mb-4 nx:max-w-[64ch]">
          <code>InputOTPSlot</code> uses the same two halves, but on{' '}
          <code>data-[active=true]:</code> instead of{' '}
          <code>focus-visible:</code>. The ring marks the slot with the caret.
          InputOTPSlot has no error state.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-4 nx:mb-4 nx:max-w-[64ch]">
          An invalid field always shows an error border. On focus, both halves
          of the ring turn the error color. Press Tab to focus the invalid field
          example.
        </p>
        <div
          data-md-skip
          className="nx:flex nx:flex-wrap nx:items-center nx:gap-6 nx:mb-4"
        >
          <Input
            aria-invalid
            aria-label="Invalid field specimen"
            className="nx:w-48"
            defaultValue="Invalid value"
          />
        </div>
        <CodeSample lang="tsx">
          {`nx:aria-invalid:border-error-border
nx:aria-invalid:focus-visible:outline-focus-error
nx:aria-invalid:focus-visible:border-focus-error`}
        </CodeSample>
      </section>

      {/* ── One color ───────────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          One color for every control
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Every variant uses <code>focus-default</code>, including destructive
          buttons. The ring says &ldquo;you are here&rdquo;, not what the
          control does.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          <code>focus-default</code> follows the brand color, so you never need
          a brand-specific focus class. Invalid fields use{' '}
          <code>focus-error</code>.
        </p>
      </section>

      {/* ── Container focus ─────────────────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Container focus is a separate, neutral token
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          <code>border-focus</code> is the gray border a container shows while
          something inside it has focus. Command&rsquo;s search row and
          DatePicker&rsquo;s frame use it.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          <code>border-focus</code> doesn&rsquo;t follow the brand. Use{' '}
          <code>focus-default</code> on the focused control, and{' '}
          <code>border-focus</code> only on the wrapper around it.
        </p>
        <CodeSample lang="tsx">
          {`nx:focus-within:border-border-focus   /* container: neutral */
nx:focus-visible:outline-focus-default /* control: brand */`}
        </CodeSample>
      </section>

      {/* ── Where the ring does not go ──────────────────────── */}
      <section className="nx:mb-12">
        <SectionHeading className="nx:typography-heading-small nx:mb-1">
          Where the ring does not go
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          Anything you reach with Tab gets the ring. Menu rows don&rsquo;t,
          because they take focus when the pointer moves over them, and a ring
          would flash for mouse users. Menu rows change background instead.
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
          Write your own focus styles
        </SectionHeading>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          <strong className="nx:text-foreground">
            Never pair <code>nx:outline-none</code> with a focus-outline class
            on the same element.
          </strong>{' '}
          <code>outline-none</code> hides every outline on the element, so the
          ring never shows. To hide a nested control&rsquo;s ring, use{' '}
          <code>nx:focus-visible:outline-none</code> instead.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4 nx:max-w-[64ch]">
          <strong className="nx:text-foreground">
            Never use <code>nx:transition-colors</code> on a surface that paints
            a ring.
          </strong>{' '}
          <code>transition-colors</code> animates <code>outline-color</code>, so
          the ring fades in instead of appearing on the keypress.
        </p>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-[64ch]">
          The Nexus ESLint rules flag <code>transition-colors</code> and a ring
          class in the same class string, <code>cva()</code> or{' '}
          <code>cn()</code> call. Use <code>nx:transition-control</code> or{' '}
          <code>nx:transition-field</code> instead:
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
