import type {} from '@vitest/browser-playwright';
import type { BrowserCommand, BrowserCommandContext } from 'vitest/node';

type Page = BrowserCommandContext['page'];
type Session = Awaited<
  ReturnType<ReturnType<Page['context']>['newCDPSession']>
>;

interface DomNode {
  nodeId: number;
  children?: DomNode[];
  contentDocument?: DomNode;
}

// Forced states live on the CDP session that set them, so each page keeps one.
const sessions = new WeakMap<Page, Promise<Session>>();

function sessionFor(page: Page) {
  let session = sessions.get(page);
  if (!session) {
    session = page
      .context()
      .newCDPSession(page)
      .then(async (cdp) => {
        await cdp.send('DOM.enable');
        await cdp.send('CSS.enable');
        return cdp;
      });
    sessions.set(page, session);
  }
  return session;
}

// Stories render inside Vitest's tester iframe, so search every frame document.
function frameDocuments(node: DomNode): DomNode[] {
  const documents: DomNode[] = [];
  if (node.contentDocument) {
    documents.push(
      node.contentDocument,
      ...frameDocuments(node.contentDocument)
    );
  }
  for (const child of node.children ?? []) {
    documents.push(...frameDocuments(child));
  }
  return documents;
}

/**
 * Playwright-side half of `forcePseudoState`: sets the element's forced
 * `:hover` / `:active` state through CDP `CSS.forcePseudoState`, so stories
 * read those styles without moving a real pointer. An empty list clears them.
 */
export const forcePseudoState: BrowserCommand<
  [selector: string, states: Array<'hover' | 'active'>]
> = async ({ page }, selector, states) => {
  const cdp = await sessionFor(page);
  const { root } = await cdp.send('DOM.getDocument', {
    depth: -1,
    pierce: true,
  });
  for (const document of frameDocuments(root as DomNode)) {
    const { nodeId } = await cdp.send('DOM.querySelector', {
      nodeId: document.nodeId,
      selector,
    });
    if (!nodeId) continue;
    await cdp.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses: states,
    });
    return;
  }
  throw new Error(`Pseudo-state target missing: ${selector}`);
};
