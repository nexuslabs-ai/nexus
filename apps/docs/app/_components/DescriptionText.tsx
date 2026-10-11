import { cn } from '@nexus_ds/react/utils';

import { InlineCode } from './InlineCode';

const TEXT_CLASS = 'nx:typography-body-default nx:text-muted-foreground';

/** `` `code` `` spans become InlineCode; everything else stays text. */
function inline(text: string) {
  return text
    .split(/(`[^`]+`)/)
    .map((part, index) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
        <InlineCode key={index}>{part.slice(1, -1)}</InlineCode>
      ) : (
        part
      )
    );
}

type Segment = { list: boolean; lines: string[] };

/** Blank lines end a paragraph; consecutive `- ` lines form one list. */
function segments(text: string): Segment[] {
  const result: Segment[] = [];
  for (const raw of text.trim().split('\n')) {
    const line = raw.trim();
    const last = result.at(-1);
    if (!line) {
      if (last) result.push({ list: false, lines: [] });
      continue;
    }
    const list = line.startsWith('- ');
    const content = list ? line.slice(2) : line;
    if (last && last.list === list && (list || last.lines.length > 0)) {
      last.lines.push(content);
    } else {
      result.push({ list, lines: [content] });
    }
  }
  return result.filter((segment) => segment.lines.length > 0);
}

/** A story's `docs.description` as the page shows it. */
export function DescriptionText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn('nx:flex nx:flex-col nx:gap-2 nx:max-w-[64ch]', className)}
    >
      {segments(text).map((segment, index) =>
        segment.list ? (
          <ul
            key={index}
            className={cn(TEXT_CLASS, 'nx:list-disc nx:ps-5 nx:space-y-1')}
          >
            {segment.lines.map((line) => (
              <li key={line}>{inline(line)}</li>
            ))}
          </ul>
        ) : (
          <p key={index} className={TEXT_CLASS}>
            {inline(segment.lines.join(' '))}
          </p>
        )
      )}
    </div>
  );
}
