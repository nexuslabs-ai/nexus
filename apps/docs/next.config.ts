import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DOCS_THEME_BOOTSTRAP_CSP_HASH } from './theme-csp';

const SCRIPT_SRC = [
  "'self'",
  DOCS_THEME_BOOTSTRAP_CSP_HASH,
  "'report-sample'",
  process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : null,
]
  .filter(Boolean)
  .join(' ');

const CONNECT_SRC = [
  "'self'",
  process.env.NODE_ENV === 'development' ? 'ws:' : null,
]
  .filter(Boolean)
  .join(' ');

const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  `script-src ${SCRIPT_SRC}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src ${CONNECT_SRC}`,
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const PERMISSIONS_POLICY = [
  'camera=()',
  'geolocation=()',
  'microphone=()',
  'payment=()',
  'usb=()',
].join(', ');

const SECURITY_HEADERS = [
  {
    key: 'Content-Security-Policy-Report-Only',
    value: CONTENT_SECURITY_POLICY_REPORT_ONLY,
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

// No remark/rehype plugins yet — keeps dev (Turbopack) happy. When GFM tables
// or heading anchors are needed, add them as string-named plugins.
const withMDX = createMDX({});

export default withMDX(nextConfig);
