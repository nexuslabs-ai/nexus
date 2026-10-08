'use client';

import * as React from 'react';

import { toast, Toaster as Sonner, type ToasterProps, useSonner } from 'sonner';

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconLoader2,
} from '../../lib/icons';
import { useNexusRootAttributes } from '../../lib/nexus-root-context';

/** Tabler icons in place of sonner's bundled set, matching Nexus iconography. */
const toasterIcons = {
  success: <IconCircleCheck className="nx:size-icon-glyph-default" />,
  info: <IconInfoCircle className="nx:size-icon-glyph-default" />,
  warning: <IconAlertTriangle className="nx:size-icon-glyph-default" />,
  error: <IconAlertCircle className="nx:size-icon-glyph-default" />,
  loading: (
    <IconLoader2 className="nx:size-icon-glyph-default nx:animate-spin" />
  ),
};

const color = (name: string) =>
  `var(--nx-color-${name}, var(--nx-default-color-${name}))`;

/**
 * Sonner reads these custom properties off the toaster container to colour each
 * toast; map every one to its Nexus semantic token. The `-bg`/`-text`/`-border`
 * triples for success/error/warning/info apply when `richColors` is enabled.
 */
const toasterThemeVars = {
  '--normal-bg': color('container'),
  '--normal-text': color('foreground'),
  '--normal-border': color('border-default'),
  '--border-radius': 'var(--nx-radius-md)',
  '--success-bg': color('success-background'),
  '--success-text': color('success-foreground'),
  '--success-border': color('success-border'),
  '--info-bg': color('information-background'),
  '--info-text': color('information-foreground'),
  '--info-border': color('information-border'),
  '--warning-bg': color('warning-background'),
  '--warning-text': color('warning-foreground'),
  '--warning-border': color('warning-border'),
  '--error-bg': color('error-background'),
  '--error-text': color('error-foreground'),
  '--error-border': color('error-border'),
};

/**
 * Toaster
 *
 * Renders toast notifications, themed to Nexus tokens and riding the Nexus
 * toast layer (z-index 100). Mount once inside your Nexus root, then call
 * `toast(...)` (re-exported here) from anywhere. Sonner renders in place, so
 * the toaster sits inside the root and follows its light or dark mode.
 *
 * @example
 * ```tsx
 * import { Toaster, toast } from '@nexus_ds/react';
 *
 * function App() {
 *   return (
 *     <>
 *       <button onClick={() => toast('Saved')}>Save</button>
 *       <Toaster />
 *     </>
 *   );
 * }
 * ```
 */
function Toaster({ style, ...props }: ToasterProps) {
  const { 'data-nx-mode': mode } = useNexusRootAttributes();
  return (
    <div data-slot="toaster">
      <Sonner
        theme={mode === 'dark' ? 'dark' : 'light'}
        icons={toasterIcons}
        style={
          {
            ...toasterThemeVars,
            // Sonner injects a runtime <style> pinning the toaster to
            // z-index:999999999 (not !important); an inline style outranks that
            // selector rule, keeping us on the Nexus toast layer without `!`.
            zIndex: 'var(--nx-z-index-toast, 100)',
            ...style,
          } as React.CSSProperties
        }
        {...props}
      />
    </div>
  );
}

export { toast, Toaster, useSonner };
export type { ToasterProps };
