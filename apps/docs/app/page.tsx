import Link from 'next/link';

import { LiveThemeSwapper } from './_components/LiveThemeSwapper';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from './_components/nexus';

const STATS = [
  { n: '5', l: 'Bases' },
  { n: '17', l: 'Components' },
  { n: '2', l: 'Themes' },
  { n: '100%', l: 'Tokenized' },
];

const AUDIENCES = [
  {
    title: 'Designer',
    desc: 'Figma library, design tokens, and Code Connect — kept in lockstep with code.',
    href: '/getting-started/designers',
  },
  {
    title: 'Engineer',
    desc: 'Install, wire your theme, and ship your first component in minutes.',
    href: '/getting-started/install',
  },
  {
    title: 'AI agent',
    desc: 'llms.txt, a mirror of the rules, and authoring conventions agents can parse.',
    href: '/agents',
  },
];

const SECTIONS = [
  {
    count: '6 pages',
    title: 'Foundations',
    desc: 'Color · Typography · Spacing · Radius · Layering · Responsive',
    href: '/foundations',
  },
  {
    count: '5 groups · 17 components',
    title: 'Components',
    desc: 'Inputs · Containers · Navigation · Display · Primitives',
    href: '/components',
  },
  {
    count: '3 pages',
    title: 'Theming',
    desc: 'Multi-brand · density modes · consumer overrides',
    href: '/theming',
  },
  {
    count: '5 pages',
    title: 'Tools',
    desc: 'nx: prefix · Code Connect · ESLint · audits · Storybook',
    href: '/tools',
  },
  {
    count: '3 pages',
    title: 'Guidance',
    desc: 'Engineering principles · testing model · contribution',
    href: '/guidance',
  },
  {
    count: '3 pages',
    title: 'For AI agents',
    desc: 'llms.txt · rules mirror · authoring',
    href: '/agents',
  },
];

const BLUE_RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const BASE_CHIPS = ['slate', 'stone', 'neutral', 'gray', 'zinc'];

export default function Home() {
  return (
    <div className="nx:max-w-[960px] nx:mx-auto nx:px-6">
      {/* Hero */}
      <section className="nx:text-center nx:pt-20 nx:pb-16">
        <span className="nx:inline-flex nx:items-center nx:gap-2 nx:font-mono nx:text-xs nx:uppercase nx:tracking-[0.14em] nx:text-primary-subtle-foreground">
          <span className="nx:size-1.5 nx:rounded-full nx:bg-primary-background" />
          AI-native design system
        </span>
        <h1 className="nx:text-[clamp(2.5rem,5vw,3.75rem)] nx:font-light nx:leading-[1.05] nx:tracking-[-0.01em] nx:mt-6 nx:text-balance">
          Design once. Ship every brand.
        </h1>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-5 nx:max-w-[36rem] nx:mx-auto nx:text-pretty">
          A multi-brand design system tuned for perceptual consistency across
          five bases — authored from a single source of truth by humans and
          agents alike.
        </p>
        <div className="nx:mt-8 nx:flex nx:flex-wrap nx:gap-3 nx:justify-center">
          <Button asChild>
            <Link href="/getting-started">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/components">Browse components</Link>
          </Button>
        </div>
        <dl className="nx:mt-16 nx:flex nx:flex-wrap nx:justify-center nx:gap-x-10 nx:gap-y-5 nx:border-t nx:border-border-default nx:pt-8 nx:max-w-[36rem] nx:mx-auto">
          {STATS.map((s) => (
            <div key={s.l}>
              <dt className="nx:typography-heading-medium">{s.n}</dt>
              <dd className="nx:font-mono nx:text-[11px] nx:uppercase nx:tracking-wider nx:text-muted-foreground-subtle nx:mt-1">
                {s.l}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Audience cards */}
      <h2 className="nx:typography-heading-small nx:mt-4 nx:mb-3">I am a…</h2>
      <div className="nx:grid nx:grid-cols-1 nx:md:grid-cols-3 nx:gap-4">
        {AUDIENCES.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="nx:no-underline nx:text-inherit"
          >
            <Card className="nx:h-full nx:hover:border-border-primary nx:transition-colors">
              <CardHeader>
                <CardTitle className="nx:typography-heading-xsmall">
                  {a.title}
                </CardTitle>
                <CardDescription>{a.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Section cards */}
      <h2 className="nx:typography-heading-small nx:mt-12 nx:mb-3">
        What&rsquo;s inside
      </h2>
      <div className="nx:grid nx:grid-cols-1 nx:md:grid-cols-3 nx:gap-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="nx:no-underline nx:text-inherit"
          >
            <Card className="nx:h-full nx:hover:border-border-primary nx:transition-colors">
              <CardHeader>
                <div className="nx:font-mono nx:text-[10px] nx:uppercase nx:tracking-wider nx:text-muted-foreground-subtle nx:mb-1">
                  {s.count}
                </div>
                <CardTitle className="nx:typography-heading-xsmall">
                  {s.title}
                </CardTitle>
                <CardDescription className="nx:text-xs">
                  {s.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Highlights */}
      <h2 className="nx:typography-heading-small nx:mt-12 nx:mb-3">
        Highlights
      </h2>
      <div className="nx:grid nx:grid-cols-1 nx:md:grid-cols-2 nx:gap-4 nx:pb-4">
        <LiveThemeSwapper />
        <div className="nx:h-full nx:rounded-xl nx:border nx:border-border-default nx:bg-container nx:p-5 nx:flex nx:flex-col nx:gap-4">
          <div className="nx:flex nx:items-center nx:justify-between">
            <span className="nx:font-mono nx:text-[11px] nx:uppercase nx:tracking-wider nx:text-muted-foreground-subtle">
              11-step palette
            </span>
            <span className="nx:font-mono nx:text-[11px] nx:text-muted-foreground-subtle">
              OKLCH · APCA-gated
            </span>
          </div>
          <div>
            <div className="nx:text-sm nx:text-muted-foreground nx:mb-2">
              Brand · Blue
            </div>
            <div className="nx:flex nx:h-12 nx:overflow-hidden nx:rounded-lg nx:border nx:border-border-default">
              {BLUE_RAMP.map((shade) => (
                <span
                  key={shade}
                  className="nx:flex-1"
                  style={{ background: `var(--nx-color-blue-${shade})` }}
                  title={`blue-${shade}`}
                />
              ))}
            </div>
          </div>
          <div className="nx:mt-auto">
            <div className="nx:text-sm nx:text-muted-foreground nx:mb-2">
              5 bases · perceptually aligned
            </div>
            <div className="nx:grid nx:grid-cols-5 nx:gap-2">
              {BASE_CHIPS.map((b) => (
                <div
                  key={b}
                  className="nx:rounded-lg nx:border nx:border-border-default nx:h-14 nx:flex nx:items-end nx:p-1.5 nx:font-mono nx:text-[10px]"
                  style={{
                    background: `var(--nx-color-${b}-900)`,
                    color: `var(--nx-color-${b}-300)`,
                  }}
                >
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
