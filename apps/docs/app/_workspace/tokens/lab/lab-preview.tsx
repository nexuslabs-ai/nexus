'use client';

import { useId } from 'react';

import { Alert, AlertDescription, AlertTitle, Badge } from '@nxds/react';

import { Sampler } from '../../sampler';

const ALERTS = [
  {
    variant: 'information',
    title: 'Bank verification in progress',
    description: 'Payouts resume once the account ending 4021 is confirmed.',
  },
  {
    variant: 'success',
    title: 'Payout sent',
    description: '$4,820.00 is on its way to the account ending 4021.',
  },
  {
    variant: 'warning',
    title: 'Card expires soon',
    description: 'Update the card ending 1180 before 31 October.',
  },
  {
    variant: 'destructive',
    title: 'Payment declined',
    description: 'The issuer declined the card ending 1180.',
  },
] as const;

const BADGES = ['information', 'success', 'warning', 'error'] as const;

/** The components a theme change reaches: status surfaces, then the sampler. */
export function LabPreview() {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="nx:space-y-6">
      <h2
        id={headingId}
        className="nx:typography-label-small nx:text-muted-foreground"
      >
        Preview
      </h2>
      <div className="nx:space-y-3">
        {ALERTS.map((alert) => (
          <Alert key={alert.variant} variant={alert.variant}>
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
        {(['light', 'solid'] as const).map((fill) => (
          <div key={fill} className="nx:flex nx:flex-wrap nx:gap-2">
            {BADGES.map((variant) => (
              <Badge key={variant} variant={variant} fill={fill}>
                {variant}
              </Badge>
            ))}
          </div>
        ))}
      </div>
      <Sampler />
    </section>
  );
}
