'use client';

import { AspectRatio } from '@/components/aspect-ratio/aspect-ratio';

export default function AspectRatioDemo() {
  return (
    <div className="nx:w-full nx:max-w-sm">
      <AspectRatio ratio={16 / 9}>
        <div className="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
          16 / 9
        </div>
      </AspectRatio>
    </div>
  );
}
