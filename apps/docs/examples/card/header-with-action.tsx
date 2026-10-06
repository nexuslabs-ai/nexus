'use client';

import { Button } from '@/components/button/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/card/card';

export default function CardHeaderWithAction() {
  return (
    <Card className="nx:w-full nx:max-w-sm">
      <CardHeader>
        <CardTitle asChild>
          <h4>Team members</h4>
        </CardTitle>
        <CardDescription>Invite people to collaborate.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Invite
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="nx:typography-body-default">
          4 of 5 seats in use on the Team plan.
        </p>
      </CardContent>
    </Card>
  );
}
