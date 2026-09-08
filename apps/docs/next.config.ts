import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createContentSecurityPolicy, CSP_HEADER_NAME } from './csp.mjs';
import { MDX_OPTIONS } from './mdx-options';
import { DOCS_APPEARANCE_BOOTSTRAP_CSP_HASH } from './theme-csp';

const CONTENT_SECURITY_POLICY = createContentSecurityPolicy({
  appearanceScriptHash: DOCS_APPEARANCE_BOOTSTRAP_CSP_HASH,
  isDevelopment: process.env.NODE_ENV === 'development',
});

const PERMISSIONS_POLICY = [
  'camera=()',
  'geolocation=()',
  'microphone=()',
  'payment=()',
  'usb=()',
].join(', ');

const SECURITY_HEADERS = [
  {
    key: CSP_HEADER_NAME,
    value: CONTENT_SECURITY_POLICY,
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: PERMISSIONS_POLICY,
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@nexus_ds/react'],
  // let .md/.mdx resolve as modules (for content imported by the dynamic route)
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Pin the monorepo root (../.. from this file) so Turbopack doesn't walk past
  // a nested .claude/worktrees/* checkout and pick the parent repo's lockfile.
  turbopack: {
    root: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..'),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

const withMDX = createMDX({ options: MDX_OPTIONS });

export default withMDX(nextConfig);
