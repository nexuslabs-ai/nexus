import { Breadcrumb } from '../_components/Breadcrumb';
import { Placeholder } from '../_components/Placeholder';
import { RightRail } from '../_components/RightRail';

export default function Changelog() {
  return (
    <div className="nx:grid nx:gap-8 nx:max-w-[1280px] nx:mx-auto nx:px-6 nx:py-8 nx:pb-16 nx:grid-cols-1 nx:lg:grid-cols-[220px_minmax(0,1fr)_200px]">
      <aside className="nx:sticky nx:top-16 nx:self-start nx:hidden nx:lg:block">
        <h3 className="nx:text-[11px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-2">
          Changelog
        </h3>
        <ul className="nx:list-none nx:p-0 nx:m-0 nx:text-sm nx:text-muted-foreground">
          <li className="nx:px-2 nx:py-1">[ Latest ]</li>
          <li className="nx:px-2 nx:py-1">[ Previous release ]</li>
          <li className="nx:px-2 nx:py-1">[ Migration notes ]</li>
        </ul>
      </aside>
      <article className="nx:min-w-0">
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Changelog' }]}
        />
        <h1 className="nx:typography-heading-large">[ Changelog ]</h1>
        <p className="nx:typography-body-small nx:text-muted-foreground nx:mb-5">
          [ Release notes · breaking changes · migration paths ]
        </p>
        <Placeholder variant="hero">[ Latest release callout ]</Placeholder>
        <h2 className="nx:typography-heading-small nx:mt-8 nx:mb-3">
          [ Version x.y.z ]
        </h2>
        <Placeholder>[ Release entry — date, summary, links ]</Placeholder>
        <h2 className="nx:typography-heading-small nx:mt-8 nx:mb-3">
          [ Version x.y.z ]
        </h2>
        <Placeholder>[ Release entry ]</Placeholder>
      </article>
      <RightRail anchors={2} />
    </div>
  );
}
