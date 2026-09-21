import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin, ViteDevServer } from 'vite';

import type { generateTokenCatalog } from '../../../packages/core/scripts/token-catalog.js';

const repoDir = fileURLToPath(new URL('../../../', import.meta.url));
const coreDir = path.join(repoDir, 'packages/core');
const catalogModule = path.join(coreDir, 'scripts/token-catalog.js');
const virtualIds = [
  'virtual:nexus-token-catalog',
  'virtual:nexus-theme-inspection',
];

type BuildResult = Awaited<ReturnType<typeof generateTokenCatalog>>;

/** The virtual boundary serializes data; filesystem and generation stay in Node. */
export function tokenCatalogPlugin({
  tokensDir = path.join(coreDir, 'tokens'),
}: { tokensDir?: string } = {}): Plugin {
  let server: ViteDevServer | undefined;
  let generation: Promise<BuildResult> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function generate(): Promise<BuildResult> {
    if (server) {
      const generator = await server.ssrLoadModule(catalogModule);
      const engine = await server.ssrLoadModule(
        path.join(coreDir, 'src/index.ts')
      );
      return generator.generateTokenCatalog({ engine, tokensDir });
    }
    const generator =
      await import('../../../packages/core/scripts/token-catalog.js');
    const engine = await import('@nexus_ds/core');
    return generator.generateTokenCatalog({ engine, tokensDir });
  }

  async function getGeneration(): Promise<BuildResult> {
    const pending = (generation ??= generate());
    try {
      const result = await pending;
      return generation === pending ? result : getGeneration();
    } catch (error) {
      if (generation !== pending) return getGeneration();
      throw error;
    }
  }

  const watchedDirectories = [
    tokensDir,
    path.join(coreDir, 'src'),
    path.join(coreDir, 'scripts'),
  ];
  function isCatalogInput(file: string) {
    return watchedDirectories.some((directory) =>
      file.startsWith(directory + path.sep)
    );
  }

  function refresh(file: string) {
    if (!server || !isCatalogInput(file)) return;
    generation = undefined;
    // A request between the filesystem event and reload must also see fresh SSR dependencies.
    server.moduleGraph.invalidateAll();
    clearTimeout(timer);
    timer = setTimeout(() => {
      server?.ws.send({ type: 'full-reload' });
    }, 80);
  }

  return {
    name: 'nexus-token-catalog',
    enforce: 'pre',
    configureServer(devServer) {
      server = devServer;
      for (const directory of watchedDirectories) server.watcher.add(directory);
      server.watcher
        .on('add', refresh)
        .on('change', refresh)
        .on('unlink', refresh);
      server.httpServer?.once('close', () => {
        clearTimeout(timer);
        server?.watcher
          .off('add', refresh)
          .off('change', refresh)
          .off('unlink', refresh);
      });
    },
    async buildStart() {
      // Production must fail before emitting a bundle if any source is invalid.
      if (!server && this.meta.watchMode === false) await getGeneration();
    },
    resolveId(id) {
      if (virtualIds.includes(id)) return `\0${id}`;
    },
    async load(id) {
      if (!virtualIds.some((virtualId) => id === `\0${virtualId}`)) return;
      try {
        const result = await getGeneration();
        const data = id.endsWith('inspection')
          ? { status: 'ready', inspection: result.inspection }
          : { status: 'ready', catalog: result.catalog };
        return `export default ${JSON.stringify(data)};`;
      } catch (error) {
        if (!server) throw error;
        const message = error instanceof Error ? error.message : String(error);
        return `export default ${JSON.stringify({ status: 'error', message })};`;
      }
    },
    handleHotUpdate(context) {
      if (isCatalogInput(context.file)) return [];
    },
  };
}
