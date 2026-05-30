import Link from 'next/link';

import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from './_components/nexus';
import { Placeholder } from './_components/Placeholder';

const AUDIENCES = [
  {
    label: 'Audience entry',
    title: 'Designer',
    desc: '[ Figma library · token system · Code Connect ]',
    href: '/getting-started/designers',
  },
  {
    label: 'Audience entry',
    title: 'Engineer',
    desc: '[ Install · theme setup · first component ]',
    href: '/getting-started/install',
  },
  {
    label: 'Audience entry',
    title: 'AI agent',
    desc: '[ llms.txt · rules mirror · authoring ]',
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

export default function Home() {
  return (
    <div className="nx:max-w-[960px] nx:mx-auto nx:px-6 nx:py-8">
      {/* Hero */}
      <section className="nx:pt-8 nx:pb-6 nx:border-b nx:border-dashed nx:border-border-default nx:mb-6">
        <div className="nx:text-[11px] nx:uppercase nx:tracking-wider nx:text-muted-foreground-subtle nx:mb-2">
          [ Nexus thesis & positioning ]
        </div>
        <h1 className="nx:typography-heading-xlarge">[ Hero headline ]</h1>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:max-w-[60ch]">
          [ Subhead — one-paragraph thesis ]
        </p>
        <div className="nx:grid nx:grid-cols-2 nx:gap-3 nx:mt-6">
          <Button>[ Primary CTA — Get started ]</Button>
          <Button variant="outline">
            [ Secondary CTA — Browse components ]
          </Button>
        </div>
      </section>

      {/* Audience cards */}
      <h2 className="nx:typography-heading-small nx:mt-8 nx:mb-3">I am a…</h2>
      <div className="nx:grid nx:grid-cols-1 nx:md:grid-cols-3 nx:gap-4">
        {AUDIENCES.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="nx:no-underline nx:text-inherit"
          >
            <Card className="nx:h-full nx:border-dashed nx:hover:border-focus-default nx:hover:border-solid nx:transition-colors">
              <CardHeader>
                <div className="nx:text-[10px] nx:uppercase nx:tracking-wider nx:text-muted-foreground-subtle">
                  {a.label}
                </div>
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
      <h2 className="nx:typography-heading-small nx:mt-8 nx:mb-3">
        What&rsquo;s inside
      </h2>
      <div className="nx:grid nx:grid-cols-1 nx:md:grid-cols-3 nx:gap-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="nx:no-underline nx:text-inherit"
          >
            <Card className="nx:h-full nx:hover:border-focus-default nx:transition-colors">
              <CardHeader>
                <div className="nx:text-[10px] nx:uppercase nx:tracking-wider nx:text-muted-foreground-subtle nx:mb-1">
                  {s.count}
                </div>
                <CardTitle className="nx:text-base">{s.title}</CardTitle>
                <CardDescription className="nx:text-xs">
                  {s.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Highlights */}
      <h2 className="nx:typography-heading-small nx:mt-8 nx:mb-3">
        Highlights
      </h2>
      <div className="nx:grid nx:grid-cols-1 nx:md:grid-cols-2 nx:gap-3">
        <Placeholder variant="tall">
          [ Live theme swapper · 5 bases × theme ]
        </Placeholder>
        <Placeholder variant="tall">
          [ Live token swatch grid · 11-step palette ]
        </Placeholder>
      </div>
    </div>
  );
}
