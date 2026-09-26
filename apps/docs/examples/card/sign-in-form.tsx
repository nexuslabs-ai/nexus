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
import { Input } from '@/components/input/input';
import { Label } from '@/components/label/label';

export default function CardSignInForm() {
  return (
    <Card className="nx:w-full nx:max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="card-sign-in-form"
          className="nx:grid nx:gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="nx:grid nx:gap-1.5">
            <Label htmlFor="card-sign-in-email">Email</Label>
            <Input
              id="card-sign-in-email"
              type="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="nx:grid nx:gap-1.5">
            <Label htmlFor="card-sign-in-password">Password</Label>
            <Input id="card-sign-in-password" type="password" />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="card-sign-in-form" className="nx:w-full">
          Sign in
        </Button>
      </CardFooter>
    </Card>
  );
}
