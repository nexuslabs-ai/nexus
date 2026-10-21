'use client';

import * as React from 'react';

import {
  type ExternalToast,
  toast as sonnerToast,
  Toaster as Sonner,
  type ToasterProps as SonnerToasterProps,
  type ToastT,
  type ToastToDismiss,
  useSonner,
} from 'sonner';

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
  loading: <IconLoader2 className="nx:size-4 nx:animate-spin" />,
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
  '--success-border': 'var(--nx-color-success-border)',
  '--info-bg': 'var(--nx-color-information-background)',
  '--info-text': 'var(--nx-color-information-foreground)',
  '--info-border': 'var(--nx-color-information-border)',
  '--warning-bg': 'var(--nx-color-warning-background)',
  '--warning-text': 'var(--nx-color-warning-foreground)',
  '--warning-border': 'var(--nx-color-warning-border)',
  '--error-bg': 'var(--nx-color-error-background)',
  '--error-text': 'var(--nx-color-error-foreground)',
  '--error-border': 'var(--nx-color-error-border)',
};

// Nexus toasts render only in the Nexus Toaster, and a host app's own sonner
// Toaster never shows them, so mounting both never doubles a toast.
const NEXUS_TOASTER_ID = 'nexus';

function inNexusToaster<Data extends object>(data?: Data) {
  return { ...data, toasterId: NEXUS_TOASTER_ID };
}

function isNexusToast(entry: ToastT | ToastToDismiss): entry is ToastT {
  return 'toasterId' in entry && entry.toasterId === NEXUS_TOASTER_ID;
}

type Message = Parameters<typeof sonnerToast.success>[0];

const toast = Object.assign(
  (message: Parameters<typeof sonnerToast>[0], data?: ExternalToast) =>
    sonnerToast(message, inNexusToaster(data)),
  {
    success: (message: Message, data?: ExternalToast) =>
      sonnerToast.success(message, inNexusToaster(data)),
    info: (message: Message, data?: ExternalToast) =>
      sonnerToast.info(message, inNexusToaster(data)),
    warning: (message: Message, data?: ExternalToast) =>
      sonnerToast.warning(message, inNexusToaster(data)),
    error: (message: Message, data?: ExternalToast) =>
      sonnerToast.error(message, inNexusToaster(data)),
    message: (message: Message, data?: ExternalToast) =>
      sonnerToast.message(message, inNexusToaster(data)),
    loading: (message: Message, data?: ExternalToast) =>
      sonnerToast.loading(message, inNexusToaster(data)),
    custom: (
      jsx: Parameters<typeof sonnerToast.custom>[0],
      data?: ExternalToast
    ) => sonnerToast.custom(jsx, inNexusToaster(data)),
    promise: <ToastData,>(
      promise: Parameters<typeof sonnerToast.promise<ToastData>>[0],
      data?: Parameters<typeof sonnerToast.promise<ToastData>>[1]
    ) => sonnerToast.promise(promise, data && inNexusToaster(data)),
    // Without an id, dismisses every Nexus toast and leaves the host's alone.
    dismiss: (id?: number | string) => {
      if (id !== undefined) return sonnerToast.dismiss(id);
      for (const entry of sonnerToast.getToasts().filter(isNexusToast)) {
        sonnerToast.dismiss(entry.id);
      }
    },
    getHistory: () => sonnerToast.getHistory().filter(isNexusToast),
    getToasts: () => sonnerToast.getToasts().filter(isNexusToast),
  }
);

/** The Nexus toasts currently on screen. */
function useNexusToasts() {
  const { toasts } = useSonner();
  return { toasts: toasts.filter(isNexusToast) };
}

type ToasterProps = Omit<SonnerToasterProps, 'id'>;

/**
 * Renders toast notifications. Mount it once near your app root, then call
 * `toast()` from anywhere. It follows the `.dark` class for dark mode.
 *
 * @example
 * ```tsx
 * import { Toaster, toast } from '@nxds/react';
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
            zIndex: 'var(--nx-z-index-toast)',
            ...style,
          } as React.CSSProperties
        }
        {...props}
        id={NEXUS_TOASTER_ID}
      />
    </div>
  );
}

export { toast, Toaster, useNexusToasts as useSonner };
export type { ToasterProps };
