export const FOOTER_LINKS = [
  { label: 'Storybook', href: 'https://nexuslabs-ai.github.io/nexus/' },
  { label: 'GitHub', href: 'https://github.com/nexuslabs-ai/nexus' },
];

export function Footer() {
  return (
    <footer className="nx:border-t nx:border-border-default nx:mt-16">
      <div className="nx:max-w-[1280px] nx:mx-auto nx:px-6 nx:py-8 nx:flex nx:flex-col nx:gap-4 nx:sm:flex-row nx:sm:items-center nx:sm:justify-between">
        <div className="nx:flex nx:items-center nx:gap-3">
          <span className="nx:font-semibold">Nexus</span>
          <span className="nx:font-mono nx:text-[11px] nx:text-muted-foreground-subtle">
            MIT · v0.0.1
          </span>
        </div>
        <nav className="nx:flex nx:items-center nx:gap-5 nx:typography-label-default nx:text-muted-foreground">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="nx:rounded-sm nx:hover:text-foreground nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
