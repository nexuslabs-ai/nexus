import { cn } from '@nexus_ds/react/utils';

import { InlineCode } from './InlineCode';

const TEXT_CLASS = 'nx:typography-body-default nx:text-muted-foreground';

/** `` `code` `` spans become InlineCode; everything else stays text. */
function inline(text: string) {
  return text
    .split(/`([^`]+)`/)
    .map((part, index) =>
      index % 2 === 1 ? <InlineCode key={index}>{part}</InlineCode> : part
    );
}

type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

/**
 * Blank lines separate blocks. `- ` lines form a list, and an indented line
 * continues the bullet above it. Lists split only by blank lines merge.
 */
function blocks(text: string): Block[] {
  const result: Block[] = [];
  for (const chunk of text.trim().split(/\n\s*\n/)) {
    for (const [index, raw] of chunk.split('\n').entries()) {
      const line = raw.trim();
      if (!line) continue;
      const last = result.at(-1);
      const sameChunk = index > 0;
      if (line.startsWith('- ')) {
        if (last?.kind === 'list') last.items.push(line.slice(2));
        else result.push({ kind: 'list', items: [line.slice(2)] });
        continue;
      }
      if (sameChunk && last?.kind === 'list' && /^\s/.test(raw)) {
        last.items[last.items.length - 1] += ` ${line}`;
        continue;
      }
      if (sameChunk && last?.kind === 'paragraph') {
        last.text += ` ${line}`;
        continue;
      }
      result.push({ kind: 'paragraph', text: line });
    }
  }
  return result;
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
      {blocks(text).map((block, index) =>
        block.kind === 'list' ? (
          <ul
            key={index}
            className={cn(TEXT_CLASS, 'nx:list-disc nx:ps-5 nx:space-y-1')}
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{inline(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={index} className={TEXT_CLASS}>
            {inline(block.text)}
          </p>
        )
      )}
    </div>
  );
}
