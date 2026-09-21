'use client';
import type * as React from 'react';

import { Button } from '@nexus_ds/react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@nexus_ds/react';

function Example0() {
  return (
    <Card className="nx:w-full nx:max-w-md">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  );
}
function Example1() {
  return (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Basic Card
        </h3>
        <Card className="nx:w-full nx:max-w-md">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here.</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Card with Footer
        </h3>
        <Card className="nx:w-full nx:max-w-md">
          <CardHeader>
            <CardTitle>Card with Footer</CardTitle>
            <CardDescription>Includes action buttons.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Card with Action
        </h3>
        <Card className="nx:w-full nx:max-w-md">
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardDescription>Has an action in the header.</CardDescription>
            <CardAction>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Content with header action.</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="nx:mb-4 nx:typography-label-default nx:text-foreground">
          Stats Card
        </h3>
        <div className="nx:flex nx:gap-4">
          <Card className="nx:w-full nx:max-w-md">
            <CardHeader className="nx:pb-2">
              <CardDescription>Revenue</CardDescription>
              <p className="nx:col-start-1 nx:min-w-0 nx:typography-heading-medium nx:text-foreground">
                $12,345
              </p>
            </CardHeader>
            <CardContent>
              <p className="nx:typography-label-small nx:text-muted-foreground">
                +12% growth
              </p>
            </CardContent>
          </Card>
          <Card className="nx:w-full nx:max-w-md">
            <CardHeader className="nx:pb-2">
              <CardDescription>Users</CardDescription>
              <p className="nx:col-start-1 nx:min-w-0 nx:typography-heading-medium nx:text-foreground">
                1,234
              </p>
            </CardHeader>
            <CardContent>
              <p className="nx:typography-label-small nx:text-muted-foreground">
                +5% growth
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
    </div>
  );
}
