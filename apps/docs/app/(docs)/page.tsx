import Link from 'next/link';

import { HomeHero } from '../_components/home-hero/HomeHero';
import { LiveThemeSwapper } from '../_components/LiveThemeSwapper';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../_components/nexus';
import { describeSize } from '../_lib/home-counts';
import {
  CARD_JOINER,
  PAGE_MANIFEST,
  requirePage,
  requireSection,
} from '../_lib/manifest';

const BLUE_RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const BASE_CHIPS = ['slate', 'stone', 'neutral', 'gray', 'zinc'];

const AUDIENCES = [
  {
    title: 'Engineer',
    desc: 'Set up your app, add the theme, and copy in your first component.',
    href: requirePage('getting-started', 'install').route,
  },
  {
    title: 'AI agent',
    desc: 'Every page as Markdown, indexed in /llms.txt.',
    href: requirePage('agents', 'llms-txt').route,
  },
];

// requireSection, not the literal: a renamed section fails the build here.
const AUDIENCE_SLUG = requireSection('getting-started').slug;

const SECTION_CARDS = PAGE_MANIFEST.filter(
  (section) => section.slug !== AUDIENCE_SLUG
).map((section) => ({
  count: describeSize(section),
  title: section.title,
  desc: section.pages.map((page) => page.label).join(CARD_JOINER),
  href: section.href,
}));

export default function Home() {
  return (
    <div className="nx:max-w-[960px] nx:mx-auto nx:px-6">
      <HomeHero>
        {/* Audience cards */}
        <h2 className="nx:typography-heading-small nx:mt-4 nx:mb-3">I am a…</h2>
        <div className="nx:grid nx:grid-cols-1 nx:md:grid-cols-2 nx:gap-4">
          {AUDIENCES.map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="nx:no-underline nx:text-inherit"
            >
              <Card className="nx:h-full nx:hover:border-primary-border nx:transition-colors">
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
          {SECTION_CARDS.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="nx:no-underline nx:text-inherit"
            >
              <Card className="nx:h-full nx:hover:border-primary-border nx:transition-colors">
                <CardHeader>
                  <div className="nx:font-mono nx:text-[10px] nx:uppercase nx:tracking-wider nx:text-muted-foreground-subtle nx:mb-1">
                    {s.count}
                  </div>
                  <CardTitle className="nx:typography-heading-xsmall">
                    {s.title}
                  </CardTitle>
                  <CardDescription className="nx:typography-body-small">
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
              <div className="nx:typography-label-default nx:text-muted-foreground nx:mb-2">
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
              <div className="nx:typography-label-default nx:text-muted-foreground nx:mb-2">
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
      </HomeHero>
    </div>
  );
}
