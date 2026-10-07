import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MDX_OPTIONS } from './mdx-options';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@nexus_ds/react'],
  // let .md/.mdx resolve as modules (for content imported by the dynamic route)
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Pin the monorepo root (../.. from this file) so Turbopack doesn't walk past
  // a nested .claude/worktrees/* checkout and pick the parent repo's lockfile.
  turbopack: {
    root: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..'),
  },
};

const withMDX = createMDX({ options: MDX_OPTIONS });

export default withMDX(nextConfig);
