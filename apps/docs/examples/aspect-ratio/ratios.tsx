'use client';

import { AspectRatio } from '@/components/aspect-ratio/aspect-ratio';

export default function AspectRatioRatios() {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-4">
      <div className="nx:w-40">
        <AspectRatio ratio={1}>
          <div className="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
            1 / 1
          </div>
        </AspectRatio>
      </div>
      <div className="nx:w-40">
        <AspectRatio ratio={4 / 3}>
          <div className="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
            4 / 3
          </div>
        </AspectRatio>
      </div>
    </div>
  );
}
