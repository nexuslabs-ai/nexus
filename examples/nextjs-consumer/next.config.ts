import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

// Not `import.meta.dirname`: that is undefined before Node 20.11.
const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // This app lives inside the Nexus monorepo for convenience, but it's a
  // standalone consumer — pin the tracing root here so Next doesn't walk up to
  // the monorepo lockfile.
  outputFileTracingRoot: appDir,
  // This is a demo consumer; it isn't wired into the monorepo's lint.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
