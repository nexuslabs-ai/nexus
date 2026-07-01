import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This app lives inside the Nexus monorepo for convenience, but it's a
  // standalone consumer — pin the tracing root here so Next doesn't walk up to
  // the monorepo lockfile.
  outputFileTracingRoot: import.meta.dirname,
  // This is a demo consumer; it isn't wired into the monorepo's lint.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
