import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@nexus/react'],
  // let .md/.mdx resolve as modules (for content imported by the dynamic route)
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
};

// No remark/rehype plugins yet — keeps dev (Turbopack) happy. When GFM tables
// or heading anchors are needed, add them as string-named plugins.
const withMDX = createMDX({});

export default withMDX(nextConfig);
