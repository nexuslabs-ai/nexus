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
    <form
      className="nx:w-full nx:max-w-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h4>Sign in</h4>
          </CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="nx:grid nx:gap-4">
          <div className="nx:grid nx:gap-1.5">
            <Label htmlFor="card-sign-in-email">Email</Label>
            <Input
              id="card-sign-in-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="nx:grid nx:gap-1.5">
            <Label htmlFor="card-sign-in-password">Password</Label>
            <Input
              id="card-sign-in-password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="nx:w-full">
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
