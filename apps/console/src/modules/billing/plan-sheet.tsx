import { useEffect, useState } from 'react';

import {
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
  toast,
} from '@nexus/react';
import { IconCheck } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type BillingCycle,
  billingKeys,
  changePlan,
  PLAN_TIERS,
  type PlanTierId,
  type Subscription,
} from '../../lib/billing-api';
import { formatCurrency } from '../../lib/format';

import { planTier, tierPrice } from './billing-ui';

interface PlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The live subscription — the picker pre-selects its tier + cycle. */
  subscription: Subscription;
}

export function PlanSheet({
  open,
  onOpenChange,
  subscription,
}: PlanSheetProps) {
  const queryClient = useQueryClient();
  const [tier, setTier] = useState<PlanTierId>(subscription.tier);
  const [cycle, setCycle] = useState<BillingCycle>(subscription.cycle);

  // Re-sync to the live subscription each time the sheet opens — the instance is
  // persistent, so without this an abandoned selection survives into the next
  // open (the reset-on-open pattern from the CRM/Projects edit sheets).
  useEffect(() => {
    if (open) {
      setTier(subscription.tier);
      setCycle(subscription.cycle);
    }
  }, [open, subscription.tier, subscription.cycle]);

  const mutation = useMutation({
    mutationFn: () => changePlan({ tier, cycle }),
    onSuccess: ({ subscription: updated }) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.overview });
      toast.success('Plan updated', {
        description: `You're now on ${planTier(updated.tier).name}, billed ${updated.cycle}.`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unchanged = tier === subscription.tier && cycle === subscription.cycle;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="nx:flex nx:w-full nx:flex-col nx:sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Change plan</SheetTitle>
          <SheetDescription>
            Pick a tier and billing cycle. Changes take effect immediately.
          </SheetDescription>
        </SheetHeader>

        <div className="nx:min-h-0 nx:flex-1 nx:space-y-5 nx:overflow-y-auto nx:px-4">
          <div className="nx:border-border-default nx:flex nx:items-center nx:justify-between nx:gap-4 nx:rounded-lg nx:border nx:p-3">
            <div className="nx:space-y-0.5">
              <Label htmlFor="billing-cycle">Annual billing</Label>
              <p className="nx:text-muted-foreground nx:text-sm">
                Save with a yearly commitment.
              </p>
            </div>
            <Switch
              id="billing-cycle"
              checked={cycle === 'annual'}
              onCheckedChange={(on) => setCycle(on ? 'annual' : 'monthly')}
            />
          </div>

          <RadioGroup
            value={tier}
            // Radio values are PLAN_TIERS ids, so the value is always a PlanTierId.
            onValueChange={(value) => setTier(value as PlanTierId)}
            className="nx:space-y-3"
          >
            {PLAN_TIERS.map((plan) => {
              const selected = tier === plan.id;
              const price = tierPrice(plan, cycle);
              return (
                <Label
                  key={plan.id}
                  htmlFor={`tier-${plan.id}`}
                  className={`nx:flex nx:cursor-pointer nx:gap-3 nx:rounded-lg nx:border nx:p-4 ${selected ? 'nx:border-border-primary nx:bg-primary-subtle' : 'nx:border-border-default'}`}
                >
                  <RadioGroupItem
                    value={plan.id}
                    id={`tier-${plan.id}`}
                    className="nx:mt-1"
                  />
                  <div className="nx:flex-1 nx:space-y-1">
                    <div className="nx:flex nx:items-baseline nx:justify-between nx:gap-2">
                      <span className="nx:text-foreground nx:font-medium">
                        {plan.name}
                      </span>
                      <span className="nx:text-foreground nx:text-sm">
                        {price === 0 ? 'Free' : `${formatCurrency(price)}/mo`}
                      </span>
                    </div>
                    <p className="nx:text-muted-foreground nx:text-sm">
                      {plan.blurb}
                    </p>
                    <ul className="nx:text-muted-foreground nx:space-y-1 nx:pt-1 nx:text-sm">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="nx:flex nx:items-center nx:gap-2"
                        >
                          <IconCheck className="nx:text-success-subtle-foreground nx:size-4 nx:shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </div>

        <SheetFooter>
          <Button
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={unchanged}
          >
            {unchanged ? 'No changes' : 'Update plan'}
          </Button>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
