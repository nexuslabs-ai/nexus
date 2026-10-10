import {
  createNexusAppearanceBootstrapScript,
  createNexusAppearanceSnapshotFromState,
} from '@nexus_ds/core';
import { createHash } from 'node:crypto';

import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
} from './app/_lib/appearance-controls';

const DOCS_APPEARANCE_BOOTSTRAP_SCRIPT = createNexusAppearanceBootstrapScript({
  storageKey: DOCS_APPEARANCE_STORAGE_KEY,
  defaultSnapshot: createNexusAppearanceSnapshotFromState(
    DOCS_APPEARANCE_DEFAULT_STATE
  ),
});

const DOCS_APPEARANCE_BOOTSTRAP_CSP_HASH = `'sha256-${createHash('sha256')
  .update(DOCS_APPEARANCE_BOOTSTRAP_SCRIPT)
  .digest('base64')}'`;

const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  `script-src 'self' ${DOCS_APPEARANCE_BOOTSTRAP_CSP_HASH} 'report-sample'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
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

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy-Report-Only': CONTENT_SECURITY_POLICY_REPORT_ONLY,
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': PERMISSIONS_POLICY,
};
