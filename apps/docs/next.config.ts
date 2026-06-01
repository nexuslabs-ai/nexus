import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const nextConfig: NextConfig = {
  transpilePackages: ['@nexus/react'],
  // let .md/.mdx resolve as modules (for content imported by the dynamic route)
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Pin the monorepo root (../.. from this file) so Turbopack doesn't walk past
  // a nested .claude/worktrees/* checkout and pick the parent repo's lockfile.
  turbopack: {
    root: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..'),
  },
};

// No remark/rehype plugins yet — keeps dev (Turbopack) happy. When GFM tables
// or heading anchors are needed, add them as string-named plugins.
const withMDX = createMDX({});

export default withMDX(nextConfig);
