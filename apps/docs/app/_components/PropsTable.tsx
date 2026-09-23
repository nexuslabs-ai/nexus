import type * as React from 'react';

import { cn } from '@nexus_ds/react/utils';

import {
  type ComponentEntry,
  loadComponentDocs,
  type PropEntry,
} from '../_lib/props';

import { slugify, SubsectionHeading } from './Heading';
import { InlineCode } from './InlineCode';
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from './nexus';

const CELL_CLASS = 'nx:align-top nx:whitespace-normal';

type DescriptionBlock =
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'list'; items: string[] };

/**
 * The generated prop docs for one component slug — every component in it with
 * props of its own, or just `component` for one part of a multi-part slug.
 */
export async function PropsTable({
  slug,
  component,
}: {
  slug: string;
  component?: string;
}) {
  const entries = await loadComponentDocs(slug, component);
  const documented = entries.filter((entry) => entry.props.length > 0);

  if (documented.length === 0) {
    return (
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-4">
        {component ? <InlineCode>{component}</InlineCode> : 'This component'}{' '}
        adds no props of its own; it accepts the props of the element or
        primitive it wraps.
      </p>
    );
  }

  return documented.map((entry) => (
    <section key={entry.name}>
      {!component && (
        <SubsectionHeading
          id={propsHeadingId(entry.name)}
          className="nx:typography-label-default nx:font-semibold nx:mt-6 nx:mb-2"
        >
          {entry.name}
        </SubsectionHeading>
      )}
      <ComponentProps entry={entry} />
    </section>
  ));
}

// `InputOTPGroup` → `props-input-otp-group`.
function propsHeadingId(name: string) {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  return `props-${slugify(words)}`;
}

function ComponentProps({ entry }: { entry: ComponentEntry }) {
  return (
    <div className="nx:mb-6">
      <Table density="compact">
        <caption className="nx:sr-only">{entry.name} props</caption>
        <TableHeader>
          <TableRow>
            <TableHead>Prop</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entry.props.map((prop) => (
            <PropRow key={prop.name} prop={prop} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PropRow({ prop }: { prop: PropEntry }) {
  return (
    <TableRow>
      <TableRowHeader className="nx:align-top">
        <span className="nx:flex nx:items-center nx:gap-2">
          <InlineCode>{prop.name}</InlineCode>
          {prop.required && (
            <Badge variant="secondary" fill="light" isCaps={false}>
              Required
            </Badge>
          )}
        </span>
      </TableRowHeader>
      <TableCell className={cn(CELL_CLASS, 'nx:min-w-40')}>
        <InlineCode>{prop.type}</InlineCode>
      </TableCell>
      <TableCell className={CELL_CLASS}>
        {prop.defaultValue === null ? (
          <Missing label="No default documented" />
        ) : (
          <InlineCode>{prop.defaultValue}</InlineCode>
        )}
      </TableCell>
      <TableCell
        className={cn(CELL_CLASS, 'nx:min-w-64 nx:text-muted-foreground')}
      >
        {prop.description ? (
          <Description text={prop.description} />
        ) : (
          <Missing label="No description" />
        )}
      </TableCell>
    </TableRow>
  );
}

function Missing({ label }: { label: string }) {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="nx:sr-only">{label}</span>
    </>
  );
}

/** Renders the Markdown subset JSDoc uses: paragraphs, `- ` lists, code, bold, italic. */
function Description({ text }: { text: string }) {
  return (
    <div className="nx:flex nx:flex-col nx:gap-2">
      {toBlocks(text).map((block, index) =>
        block.kind === 'list' ? (
          <ul key={index} className="nx:list-disc nx:ps-5">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={index}>
            <Inline text={block.lines.join(' ')} />
          </p>
        )
      )}
    </div>
  );
}

function toBlocks(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];

  for (const chunk of text.split(/\n{2,}/)) {
    let current: DescriptionBlock | undefined;
    for (const line of chunk.split('\n')) {
      const item = line.match(/^\s*- (.*)$/)?.[1];
      if (item !== undefined) {
        if (current?.kind !== 'list') {
          current = { kind: 'list', items: [] };
          blocks.push(current);
        }
        current.items.push(item);
        continue;
      }
      if (current?.kind !== 'paragraph') {
        current = { kind: 'paragraph', lines: [] };
        blocks.push(current);
      }
      current.lines.push(line.trim());
    }
  }

  return blocks;
}

function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(/`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g)) {
    parts.push(text.slice(last, match.index));
    parts.push(<InlineSpan key={match.index} match={match} />);
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));

  return parts;
}

function InlineSpan({ match }: { match: RegExpExecArray }) {
  const [, code, strong, emphasis] = match;
  if (code !== undefined) return <InlineCode>{code}</InlineCode>;
  if (strong !== undefined) return <strong>{strong}</strong>;
  return <em>{emphasis}</em>;
}
