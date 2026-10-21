import type { Element, ElementContent, Nodes, Root } from 'hast';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import type { VFile } from 'vfile';

import { PAGE_MANIFEST } from '../app/_lib/manifest.ts';
import { DOCS_ARTICLE_ID } from '../app/_lib/table-of-contents.ts';

import { docsRoot } from './roots.mjs';

declare module 'vfile' {
  interface DataMap {
    /** The page's internal links, collected by `articleOnly`. */
    links: string[];
  }
}

/** Elements that only make sense on screen: copy buttons and breadcrumbs. */
const DROPPED_TAGS = new Set(['nav', 'button', 'script', 'style', 'svg']);
/** `data-md-skip` marks a live preview the Markdown leaves out. */
const SKIP_ATTRIBUTE = 'dataMdSkip';

const outDir = path.join(docsRoot, 'out');

if (!existsSync(outDir)) {
  console.error('Missing out/. Run `next build` first.');
  process.exit(1);
}

/** The first element in `node`'s subtree that passes `test`. */
function findElement(
  node: Nodes,
  test: (element: Element) => boolean
): Element | undefined {
  if (node.type === 'element' && test(node)) return node;
  if (!('children' in node)) return undefined;
  for (const child of node.children) {
    const found = findElement(child, test);
    if (found) return found;
  }
  return undefined;
}

function findById(node: Nodes, id: string) {
  return findElement(node, (candidate) => candidate.properties.id === id);
}

/**
 * Drops on-screen-only elements, `data-md-skip` previews and decorative
 * `aria-hidden` elements, and labels each code block with its language.
 */
function prune(node: Element) {
  node.children = node.children.filter(
    (child) =>
      child.type === 'text' ||
      (child.type === 'element' &&
        !DROPPED_TAGS.has(child.tagName) &&
        child.properties[SKIP_ATTRIBUTE] === undefined &&
        child.properties.ariaHidden !== 'true')
  );
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    // rehype-remark reads a code block's language from its `language-*` class.
    if (child.tagName === 'pre' && child.properties.dataLanguage) {
      const code = child.children.find(
        (inner): inner is Element =>
          inner.type === 'element' && inner.tagName === 'code'
      );
      if (code) {
        code.properties.className = [
          `language-${child.properties.dataLanguage}`,
        ];
      }
    }
    prune(child);
  }
}

/** Every root-relative or same-page `#id` `href` under `node`. */
function internalLinks(node: ElementContent): string[] {
  if (node.type !== 'element') return [];
  const href = String(node.properties.href);
  const own =
    node.tagName === 'a' && (href.startsWith('/') || href.startsWith('#'))
      ? [href]
      : [];
  return [...own, ...node.children.flatMap(internalLinks)];
}

/** Keeps only the page's article, minus anything that only works on screen. */
function articleOnly() {
  return (tree: Root, file: VFile) => {
    const article = findById(tree, DOCS_ARTICLE_ID);
    if (!article) {
      throw new Error(
        `No #${DOCS_ARTICLE_ID} in ${path.relative(docsRoot, file.path)}.`
      );
    }
    prune(article);
    file.data.links = internalLinks(article);
    tree.children = [article];
  };
}

const processor = unified()
  .use(rehypeParse)
  .use(articleOnly)
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify, { bullet: '-', fences: true, rule: '-' });

const parseHtml = unified().use(rehypeParse);

const builtRoutes = new Map<string, { tree?: Root } | undefined>();

/**
 * The built file a route serves, with its parsed tree when it is HTML, or
 * undefined when the build has no such route.
 */
function builtRoute(route: string) {
  if (!builtRoutes.has(route)) {
    const file = [
      path.join(outDir, route),
      path.join(outDir, `${route}.html`),
      path.join(outDir, route, 'index.html'),
    ].find(
      (candidate) => existsSync(candidate) && statSync(candidate).isFile()
    );
    builtRoutes.set(
      route,
      file === undefined
        ? undefined
        : {
            tree: file.endsWith('.html')
              ? parseHtml.parse(readFileSync(file, 'utf8'))
              : undefined,
          }
    );
  }
  return builtRoutes.get(route);
}

/** Why `href` is broken, or undefined when its route and `#id` both exist. */
function brokenReason(href: string) {
  const [location = '', id] = href.split('#');
  const [route = ''] = location.split('?');
  const built = builtRoute(route.replace(/\/$/, '') || '/index');
  if (built === undefined) return 'no such route';
  if (id && !(built.tree && findById(built.tree, id))) {
    return `no #${id} on ${route}`;
  }
  return undefined;
}

/** Each page's internal links, checked once every output is written. */
const linksByRoute = new Map<string, string[]>();
const llmsSections: string[] = [];
/** Every page's Markdown, in nav order, for `llms-full.txt`. */
const fullPages: string[] = [];

for (const section of PAGE_MANIFEST) {
  const lines: string[] = [];
  for (const page of section.pages) {
    const htmlFile = path.join(outDir, `${page.route}.html`);
    if (!existsSync(htmlFile)) {
      throw new Error(`Missing ${path.relative(docsRoot, htmlFile)}.`);
    }
    const processed = await processor.process({
      path: htmlFile,
      value: readFileSync(htmlFile, 'utf8'),
    });
    const markdown = String(processed);
    const links = processed.data.links;
    if (!links) {
      throw new Error(`No links collected for ${page.route}.`);
    }
    linksByRoute.set(
      page.route,
      links.map((href) =>
        href.startsWith('#') ? `${page.route}${href}` : href
      )
    );
    writeFileSync(path.join(outDir, `${page.route}.md`), markdown);
    fullPages.push(`<!-- ${page.route} -->\n\n${markdown}`);

    const tree = builtRoute(page.route)?.tree;
    const descriptionMeta =
      tree &&
      findElement(
        tree,
        (element) =>
          element.tagName === 'meta' &&
          element.properties.name === 'description'
      );
    if (!descriptionMeta) {
      throw new Error(
        `Missing <meta name="description"> in ${page.route}.html.`
      );
    }
    const description = descriptionMeta.properties.content;
    lines.push(`- [${page.label}](${page.route}.md): ${description}`);
  }
  if (lines.length > 0) {
    llmsSections.push(`## ${section.title}\n\n${lines.join('\n')}`);
  }
}

const LLMS_BLURB =
  '> Nexus UI is a framework-agnostic theme engine (`@nexus_ds/core`) with components you copy into your app and own. Every class uses the `nx:` Tailwind prefix.';

const llms = `# Nexus UI

${LLMS_BLURB}

Each link below is the Markdown version of a docs page. Add \`.md\` to the URL of any page listed here to get its Markdown. [/llms-full.txt](/llms-full.txt) has every page in one file. If anything here conflicts with what you know about Nexus, trust these docs.

${llmsSections.join('\n\n')}
`;

writeFileSync(path.join(outDir, 'llms.txt'), llms);
writeFileSync(
  path.join(outDir, 'llms-full.txt'),
  `# Nexus UI\n\n${LLMS_BLURB}\n\n${fullPages.join('\n\n')}`
);

const brokenLinks = [...linksByRoute].flatMap(([route, hrefs]) =>
  hrefs.flatMap((href) => {
    const reason = brokenReason(href);
    return reason ? [`${route} → ${href}: ${reason}`] : [];
  })
);

if (brokenLinks.length > 0) {
  console.error(`Broken docs links:\n${brokenLinks.join('\n')}`);
  process.exit(1);
}
