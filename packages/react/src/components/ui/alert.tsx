import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'nx:relative nx:flex nx:w-full nx:gap-3 nx:rounded-md nx:border nx:p-3 nx:text-sm',
  {
    variants: {
      variant: {
        default:
          'nx:border-border-default nx:bg-container nx:text-foreground nx:[&>svg]:text-foreground',
        error:
          'nx:border-border-error nx:text-error-text nx:[&>svg]:text-error-text',
        information:
          'nx:border-border-information nx:text-information-text nx:[&>svg]:text-information-text',
        warning:
          'nx:border-border-warning nx:text-warning-text nx:[&>svg]:text-warning-text',
        success:
          'nx:border-border-success nx:text-success-text nx:[&>svg]:text-success-text',
      },
      isBanner: {
        true: '',
        false: 'nx:bg-container',
      },
    },
    compoundVariants: [
      // Banner mode: colored surface backgrounds
      { variant: 'default', isBanner: true, class: 'nx:bg-muted' },
      { variant: 'error', isBanner: true, class: 'nx:bg-error-surface' },
      {
        variant: 'information',
        isBanner: true,
        class: 'nx:bg-information-surface',
      },
      { variant: 'warning', isBanner: true, class: 'nx:bg-warning-surface' },
      { variant: 'success', isBanner: true, class: 'nx:bg-success-surface' },
      // Non-banner mode: white background (already set by isBanner: false)
      { variant: 'error', isBanner: false, class: 'nx:bg-container' },
      { variant: 'information', isBanner: false, class: 'nx:bg-container' },
      { variant: 'warning', isBanner: false, class: 'nx:bg-container' },
      { variant: 'success', isBanner: false, class: 'nx:bg-container' },
    ],
    defaultVariants: {
      variant: 'default',
      isBanner: false,
    },
  }
);

interface AlertProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof alertVariants> {
  /**
   * Custom icon to display. Pass `null` to hide the icon entirely.
   * Defaults to TriangleAlert icon from lucide-react.
   * @default <TriangleAlert />
   * @example
   * ```tsx
   * <Alert icon={<InfoIcon />}>Custom icon</Alert>
   * <Alert icon={null}>No icon</Alert>
   * ```
   */
  icon?: React.ReactNode;
}

function Alert({
  className,
  variant,
  isBanner,
  icon,
  children,
  ...props
}: AlertProps) {
  const showIcon = icon !== null;
  const iconElement = icon === undefined ? <TriangleAlert /> : icon;

  return (
    <div
      role="alert"
      data-slot="alert"
      data-variant={variant}
      data-banner={isBanner || undefined}
      className={cn(alertVariants({ variant, isBanner, className }))}
      {...props}
    >
      {showIcon && iconElement && (
        <div
          data-slot="alert-icon"
          className="nx:flex nx:h-[18px] nx:shrink-0 nx:items-center nx:justify-center nx:pt-0.5"
        >
          <span className="nx:[&>svg]:size-4">{iconElement}</span>
        </div>
      )}
      <div data-slot="alert-content" className="nx:flex nx:flex-1 nx:flex-col nx:gap-1">
        {children}
      </div>
    </div>
  );
}

const alertTitleVariants = cva('nx:font-medium nx:leading-5 nx:tracking-normal', {
  variants: {
    variant: {
      default: 'nx:text-foreground',
      error: 'nx:text-error-text',
      information: 'nx:text-information-text',
      warning: 'nx:text-warning-text',
      success: 'nx:text-success-text',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface AlertTitleProps
  extends React.ComponentProps<'h5'>,
    VariantProps<typeof alertTitleVariants> {}

function AlertTitle({
  className,
  variant,
  children,
  ...props
}: AlertTitleProps) {
  return (
    <h5
      data-slot="alert-title"
      className={cn(alertTitleVariants({ variant, className }))}
      {...props}
    >
      {children}
    </h5>
  );
}

const alertDescriptionVariants = cva(
  'nx:text-sm nx:leading-5 nx:tracking-normal',
  {
    variants: {
      variant: {
        default: 'nx:text-muted-foreground',
        error: 'nx:text-error-text',
        information: 'nx:text-information-text',
        warning: 'nx:text-warning-text',
        success: 'nx:text-success-text',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface AlertDescriptionProps
  extends React.ComponentProps<'p'>,
    VariantProps<typeof alertDescriptionVariants> {}

function AlertDescription({
  className,
  variant,
  ...props
}: AlertDescriptionProps) {
  return (
    <p
      data-slot="alert-description"
      className={cn(alertDescriptionVariants({ variant, className }))}
      {...props}
    />
  );
}

export {
  Alert,
  AlertDescription,
  type AlertDescriptionProps,
  alertDescriptionVariants,
  type AlertProps,
  AlertTitle,
  type AlertTitleProps,
  alertTitleVariants,
  alertVariants,
};
