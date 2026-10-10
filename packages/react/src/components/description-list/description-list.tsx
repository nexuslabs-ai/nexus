import * as React from 'react';

import { cn } from '../../lib/utils';

/** Metadata expressed as term/value rows. Place actions inside the description. */
function DescriptionList({ className, ...props }: React.ComponentProps<'dl'>) {
  return (
    <dl
      data-slot="description-list"
      className={cn(
        'nx:@container/description-list nx:grid nx:w-full nx:gap-2',
        className
      )}
      {...props}
    />
  );
}

/** Group one term and its description; rows adapt to the list's available width. */
function DescriptionListItem({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="description-list-item"
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-col nx:gap-x-4 nx:gap-y-1 nx:@md/description-list:flex-row nx:@md/description-list:items-baseline',
        className
      )}
      {...props}
    />
  );
}

function DescriptionListTerm({
  className,
  ...props
}: React.ComponentProps<'dt'>) {
  return (
    <dt
      data-slot="description-list-term"
      className={cn(
        'nx:min-w-0 nx:@md/description-list:w-40 nx:@md/description-list:shrink-0 nx:wrap-anywhere nx:typography-label-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function DescriptionListDescription({
  className,
  ...props
}: React.ComponentProps<'dd'>) {
  return (
    <dd
      data-slot="description-list-description"
      className={cn(
        'nx:m-0 nx:min-w-0 nx:flex-1 nx:wrap-anywhere nx:typography-body-default nx:text-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
};
