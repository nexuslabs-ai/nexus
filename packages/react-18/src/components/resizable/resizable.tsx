import * as ResizablePrimitive from 'react-resizable-panels';

import { IconGripVertical } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * Holds a set of resizable panels. `orientation` sets the split axis.
 * Install the optional peer dependency `react-resizable-panels` in your app.
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
 * One panel inside a `ResizablePanelGroup`.
 */
function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

/**
 * Divider between two panels, resized by drag or keyboard. Give each handle an
 * `aria-label`.
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  /**
   * Shows a grip in the centre of the handle.
   */
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'nx:relative nx:flex nx:w-px nx:items-center nx:justify-center nx:bg-border-default',
        'nx:after:absolute nx:after:inset-y-0 nx:after:left-1/2 nx:after:w-1 nx:after:-translate-x-1/2',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:aria-[orientation=horizontal]:h-px nx:aria-[orientation=horizontal]:w-full nx:aria-[orientation=horizontal]:after:left-0 nx:aria-[orientation=horizontal]:after:h-1 nx:aria-[orientation=horizontal]:after:w-full nx:aria-[orientation=horizontal]:after:translate-x-0 nx:aria-[orientation=horizontal]:after:-translate-y-1/2',
        'nx:aria-[orientation=horizontal]:[&>div]:rotate-90',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="nx:z-10 nx:flex nx:h-4 nx:w-3 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:border-border-default nx:bg-border-default">
          <IconGripVertical className="nx:size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
