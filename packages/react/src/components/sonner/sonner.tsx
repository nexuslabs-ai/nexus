import * as React from 'react';

import { toast, Toaster as Sonner, type ToasterProps, useSonner } from 'sonner';

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconLoader2,
} from '../../lib/icons';

/**
 * Track the active theme by observing the `.dark` class on the document root
 * (where Nexus toggles dark mode) via MutationObserver, keeping sonner's own
 * `theme` in sync with the design system.
 */
function subscribeToTheme(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function useToasterTheme(): 'light' | 'dark' {
  return React.useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => 'light'
  );
}

/** Tabler icons in place of sonner's bundled set, matching Nexus iconography. */
const toasterIcons = {
  success: <IconCircleCheck className="nx:size-4" />,
  info: <IconInfoCircle className="nx:size-4" />,
  warning: <IconAlertTriangle className="nx:size-4" />,
  error: <IconAlertCircle className="nx:size-4" />,
  loading: (
    <IconLoader2 className="nx:size-4 nx:animate-spin nx:motion-reduce:animate-none" />
  ),
};

/**
 * Sonner reads these custom properties off the toaster container to colour each
 * toast; map every one to its Nexus semantic token. The `-bg`/`-text`/`-border`
 * triples for success/error/warning/info apply when `richColors` is enabled.
 */
const toasterThemeVars = {
  '--normal-bg': 'var(--nx-color-container)',
  '--normal-text': 'var(--nx-color-foreground)',
  '--normal-border': 'var(--nx-color-border-default)',
  '--border-radius': 'var(--nx-radius-md)',
  '--success-bg': 'var(--nx-color-success-background)',
  '--success-text': 'var(--nx-color-success-foreground)',
  '--success-border': 'var(--nx-color-border-success)',
  '--info-bg': 'var(--nx-color-information-background)',
  '--info-text': 'var(--nx-color-information-foreground)',
  '--info-border': 'var(--nx-color-border-information)',
  '--warning-bg': 'var(--nx-color-warning-background)',
  '--warning-text': 'var(--nx-color-warning-foreground)',
  '--warning-border': 'var(--nx-color-border-warning)',
  '--error-bg': 'var(--nx-color-error-background)',
  '--error-text': 'var(--nx-color-error-foreground)',
  '--error-border': 'var(--nx-color-border-error)',
};

/**
 * Toaster
 *
 * Renders toast notifications, themed to Nexus tokens and riding the Nexus
 * toast layer (z-index 100). Mount once near the root of your app, then call
 * `toast(...)` (re-exported here) from anywhere. The active theme follows the
 * `.dark` class automatically.
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
  const theme = useToasterTheme();
  return (
    <div data-slot="toaster">
      <Sonner
        theme={theme}
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
