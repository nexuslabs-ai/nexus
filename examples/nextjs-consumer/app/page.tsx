'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  NexusThemeQuickControl,
} from '@acme/react';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      {/* App chrome — the app's OWN Tailwind utilities (unprefixed): bg-slate-100,
          text-slate-900, flex, gap-*, rounded-xl. Never touched by @acme. */}
      <div className="mb-8 flex items-center justify-between rounded-xl bg-slate-100 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">nextjs-consumer</h1>
          <p className="mt-1 text-sm text-slate-500">
            App chrome uses the app&apos;s own Tailwind. The card below uses @acme
            components. Both render together, no class collisions.
          </p>
        </div>
        {/* Live runtime theming — proves the --nx-* tokens come from the provider. */}
        <NexusThemeQuickControl />
      </div>

      {/* Design-system components — nx: utilities + --nx-* tokens from the provider. */}
      <Card>
        <CardHeader>
          <CardTitle>@acme/react components</CardTitle>
          <CardDescription>
            Styled with the design system&apos;s nx:-prefixed classes and runtime
            tokens — the app&apos;s Tailwind config was never modified.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Badge>Badge</Badge>
        </CardContent>
      </Card>
    </main>
  );
}
