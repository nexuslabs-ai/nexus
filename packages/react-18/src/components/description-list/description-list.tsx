import * as React from 'react';

import { cn } from '../../lib/utils';

/** Shows metadata as term and value rows. Put actions inside the description. */
const DescriptionList = React.forwardRef<
  HTMLDListElement,
  React.PropsWithoutRef<React.ComponentProps<'dl'>>
>(function DescriptionList(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'dl'>> & {
    ref?: React.ForwardedRef<HTMLDListElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <dl
      data-slot="description-list"
      className={cn(
        'nx:@container/description-list nx:m-0 nx:grid nx:w-full nx:gap-2',
        className
      )}
      {...props}
    />
  );
});

/** Groups one term and its description. Stacks until the list has room for two columns. */
const DescriptionListItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function DescriptionListItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

const DescriptionListTerm = React.forwardRef<
  HTMLElement,
  React.PropsWithoutRef<React.ComponentProps<'dt'>>
>(function DescriptionListTerm(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'dt'>> & {
    ref?: React.ForwardedRef<HTMLElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

const DescriptionListDescription = React.forwardRef<
  HTMLElement,
  React.PropsWithoutRef<React.ComponentProps<'dd'>>
>(function DescriptionListDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'dd'>> & {
    ref?: React.ForwardedRef<HTMLElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

export {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
};
