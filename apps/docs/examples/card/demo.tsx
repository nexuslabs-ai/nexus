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

export default function CardDemo() {
  return (
    <Card className="nx:w-full nx:max-w-sm">
      <CardHeader>
        <CardTitle asChild>
          <h2>Deploy to production</h2>
        </CardTitle>
        <CardDescription>
          Ship the latest build of the main branch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="nx:typography-body-default">
          12 commits since the last release, all checks passing.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Review changes</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
}
