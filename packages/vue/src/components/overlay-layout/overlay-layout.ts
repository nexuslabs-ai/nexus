import { cva } from 'class-variance-authority';

// `animate-overlay-presence-exit` is a non-visual "presence bridge": Reka's
// Presence only waits on `animationName`, not `transitionend`, so this inert
// animation keeps a closing overlay mounted while the opacity/scale
// TRANSITIONS below run the visible exit. It animates an unread custom property (see
// generateMotionUtilitiesCSS in @nxds/core), never a transitioned property, so it
// cannot override those transitions.
const overlayPresenceExitClassName =
  'nx:data-[state=closed]:animate-overlay-presence-exit';

const overlayContentTransitionClassName = [
  'nx:transition-[opacity,scale]',
  'nx:duration-default',
  'nx:ease-move',
  'nx:data-[state=closed]:scale-95',
  'nx:data-[state=closed]:opacity-0',
  overlayPresenceExitClassName,
].join(' ');

const overlayScrimTransitionClassName = [
  'nx:transition-opacity',
  'nx:duration-default',
  'nx:ease-move',
  'nx:data-[state=closed]:opacity-0',
  overlayPresenceExitClassName,
].join(' ');

export const overlayContentVariants = cva(
  [
    // Centred with margins, not a translate: a transform would make this the
    // containing block for fixed-position popups a dialog holds.
    'nx:fixed nx:inset-0 nx:z-modal nx:m-auto nx:flex nx:h-fit nx:w-full nx:max-w-lg nx:flex-col',
    'nx:max-h-[calc(100svh-2rem)] nx:overflow-hidden',
    'nx:gap-4 nx:border-default nx:border-border-default nx:bg-container nx:py-6 nx:shadow-lg',
    overlayContentTransitionClassName,
    'nx:sm:rounded-lg',
  ].join(' ')
);

export const overlayScrimVariants = cva(
  [
    'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
    overlayScrimTransitionClassName,
  ].join(' ')
);

export const overlayHeaderVariants = cva(
  'nx:flex nx:shrink-0 nx:flex-col nx:gap-1 nx:px-6',
  {
    variants: {
      variant: {
        default: 'nx:text-center nx:sm:text-left',
        center: 'nx:items-center nx:text-center',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const overlayBodyClassName = [
  'nx:min-h-0',
  'nx:overflow-y-auto',
  'nx:px-6',
  'nx:focus-visible:outline-2',
  'nx:focus-visible:outline-focus-default',
  'nx:focus-visible:[outline-offset:-2px]',
].join(' ');

export const overlayCloseButtonClassName = [
  'nx:absolute nx:right-6 nx:top-6 nx:rounded-sm nx:border-0 nx:bg-transparent nx:p-1 nx:text-muted-foreground-subtle',
  'nx:transition-control',
  'nx:hover:bg-container-hover nx:hover:text-foreground',
  'nx:focus-visible:bg-container-hover nx:focus-visible:text-foreground',
  'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
  'nx:disabled:pointer-events-none',
].join(' ');
