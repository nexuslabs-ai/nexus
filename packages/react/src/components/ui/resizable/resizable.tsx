import * as ResizablePrimitive from 'react-resizable-panels';

import { IconGripVertical } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * ResizablePanelGroup
 *
 * Container for a set of resizable panels. `orientation` ("horizontal" |
 * "vertical") sets the split axis. `react-resizable-panels` is an optional peer
 * dependency — install it in the consuming app.
 *
 * @example
 * ```tsx
 * <ResizablePanelGroup orientation="horizontal">
 *   <ResizablePanel defaultSize={50}>One</ResizablePanel>
 *   <ResizableHandle withHandle aria-label="Resize" />
 *   <ResizablePanel defaultSize={50}>Two</ResizablePanel>
 * </ResizablePanelGroup>
 * ```
 */
function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={className}
      {...props}
    />
  );
}

/**
 * ResizablePanel
 *
 * A single panel within a `ResizablePanelGroup`.
 */
function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

/**
 * ResizableHandle
 *
 * The draggable / keyboard-resizable divider between two panels. Pass
 * `withHandle` to render a visible grip. As a focusable splitter it should be
 * given an `aria-label`.
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  /**
   * Render a visible grip affordance in the centre of the handle.
   * @default false
   */
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'nx:relative nx:flex nx:w-px nx:items-center nx:justify-center nx:bg-border-default',
        'nx:after:absolute nx:after:inset-y-0 nx:after:left-1/2 nx:after:w-1 nx:after:-translate-x-1/2 nx:pointer-coarse:after:w-11',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:aria-[orientation=horizontal]:h-px nx:aria-[orientation=horizontal]:w-full nx:aria-[orientation=horizontal]:after:left-0 nx:aria-[orientation=horizontal]:after:h-1 nx:aria-[orientation=horizontal]:after:w-full nx:aria-[orientation=horizontal]:after:translate-x-0 nx:aria-[orientation=horizontal]:after:-translate-y-1/2 nx:pointer-coarse:aria-[orientation=horizontal]:after:h-11',
        'nx:aria-[orientation=horizontal]:[&>div]:rotate-90',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="nx:z-10 nx:flex nx:h-4 nx:w-3 nx:items-center nx:justify-center nx:rounded-sm nx:border nx:border-border-default nx:bg-border-default">
          <IconGripVertical className="nx:size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
