export function RightRail({ anchors = 3 }: { anchors?: number }) {
  return (
    <aside className="nx:sticky nx:top-16 nx:self-start nx:hidden nx:lg:block">
      <h3 className="nx:text-[11px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-2">
        On this page
      </h3>
      <ul className="nx:list-none nx:p-0 nx:m-0 nx:typography-label-small nx:text-muted-foreground-subtle">
        {Array.from({ length: anchors }).map((_, i) => (
          <li key={i} className="nx:py-1">
            [ Anchor ]
          </li>
        ))}
      </ul>
    </aside>
  );
}
