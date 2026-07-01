import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  RadioGroup,
  RadioGroupItem,
  Switch,
} from '@nexus_ds/react';

const ACTIVITY = [
  { id: 'comments', label: 'Comments' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'assignments', label: 'Assignments' },
];

const FREQUENCIES = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
];

export function NotificationsTab() {
  const [productUpdates, setProductUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [activity, setActivity] = useState<Record<string, boolean>>({
    comments: true,
    mentions: true,
    assignments: false,
  });
  const [frequency, setFrequency] = useState('realtime');

  return (
    <div className="nx:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <CardDescription>Choose what we email you about.</CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-4">
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
            <div className="nx:space-y-0.5">
              <Label htmlFor="notify-product">Product updates</Label>
              <p className="nx:typography-body-default nx:text-muted-foreground">
                News about features and improvements.
              </p>
            </div>
            <Switch
              id="notify-product"
              checked={productUpdates}
              onCheckedChange={setProductUpdates}
            />
          </div>
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
            <div className="nx:space-y-0.5">
              <Label htmlFor="notify-security">Security alerts</Label>
              <p className="nx:typography-body-default nx:text-muted-foreground">
                Critical alerts about your account.
              </p>
            </div>
            <Switch
              id="notify-security"
              checked={securityAlerts}
              onCheckedChange={setSecurityAlerts}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>
            Get notified about activity that involves you.
          </CardDescription>
        </CardHeader>
        <CardContent className="nx:space-y-3">
          {ACTIVITY.map((item) => (
            <div key={item.id} className="nx:flex nx:items-center nx:gap-3">
              <Checkbox
                id={`activity-${item.id}`}
                checked={activity[item.id]}
                onCheckedChange={(checked) =>
                  setActivity((a) => ({ ...a, [item.id]: checked === true }))
                }
              />
              <Label htmlFor={`activity-${item.id}`}>{item.label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Digest frequency</CardTitle>
          <CardDescription>
            How often we bundle your notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={frequency}
            onValueChange={setFrequency}
            className="nx:space-y-3"
          >
            {FREQUENCIES.map((f) => (
              <div key={f.value} className="nx:flex nx:items-center nx:gap-3">
                <RadioGroupItem value={f.value} id={`freq-${f.value}`} />
                <Label htmlFor={`freq-${f.value}`}>{f.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
