import {
  createNxdsAppearanceBootstrapScript,
  createNxdsAppearanceSnapshotFromState,
} from '@nxds/core';
import { createHash } from 'node:crypto';

import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
} from './app/_lib/appearance-controls';
import { FRAMEWORK_BOOTSTRAP_SCRIPT } from './app/_lib/frameworks';

const DOCS_APPEARANCE_BOOTSTRAP_SCRIPT = createNxdsAppearanceBootstrapScript({
  storageKey: DOCS_APPEARANCE_STORAGE_KEY,
  defaultSnapshot: createNxdsAppearanceSnapshotFromState(
    DOCS_APPEARANCE_DEFAULT_STATE
  ),
});

function cspHash(script: string) {
  return `'sha256-${createHash('sha256').update(script).digest('base64')}'`;
}

const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  `script-src 'self' ${cspHash(DOCS_APPEARANCE_BOOTSTRAP_SCRIPT)} ${cspHash(FRAMEWORK_BOOTSTRAP_SCRIPT)} 'report-sample'`,
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
