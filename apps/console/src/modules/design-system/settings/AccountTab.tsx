import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@nexus/react';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise' },
];

export function AccountTab() {
  const [plan, setPlan] = useState('pro');
  const [billingEmail, setBillingEmail] = useState('billing@example.com');

  const handleDelete = () => {
    toast.error('Account deleted', {
      description: 'Your account and all of its data have been removed.',
    });
  };

  return (
    <div className="nx:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan &amp; billing</CardTitle>
          <CardDescription>
            Manage your subscription and billing details.
          </CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
            <Label htmlFor="account-plan">Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger id="account-plan" className="nx:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="nx:space-y-2">
            <Label htmlFor="billing-email">Billing email</Label>
            <Input
              id="billing-email"
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="nx:border-border-error">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all of its data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your account and removes all of your
                  data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
