'use client';

import { Button } from '@/components/button/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/card/card';

export default function CardFooterActions() {
  return (
    <Card className="nx:w-full nx:max-w-sm">
      <CardHeader>
        <CardTitle>Email notifications</CardTitle>
        <CardDescription>Choose what lands in your inbox.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="nx:typography-body-default">
          You will get a daily digest of mentions and assigned issues.
        </p>
      </CardContent>
      <CardFooter className="nx:justify-end">
        <Button variant="outline">Cancel</Button>
        <Button>Save preferences</Button>
      </CardFooter>
    </Card>
  );
}
