'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@acme/react';
import { IconInfoCircle, IconPlus } from '@tabler/icons-react';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function ComponentsPage() {
  return (
    <div className="space-y-6">
      <Section title="Buttons" description="Variants and sizes.">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <IconPlus />
            </Button>
            <Button loading>Loading</Button>
          </div>
        </div>
      </Section>

      <Section title="Badges" description="Status and emphasis.">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Selection controls" description="Checkbox, switch, radio.">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox id="c1" defaultChecked />
              <Label htmlFor="c1">Email notifications</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="s1" defaultChecked />
              <Label htmlFor="s1">Compact mode</Label>
            </div>
            <RadioGroup defaultValue="week">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="day" id="r1" />
                <Label htmlFor="r1">Daily</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="week" id="r2" />
                <Label htmlFor="r2">Weekly</Label>
              </div>
            </RadioGroup>
          </div>
        </Section>

        <Section title="Slider & avatars" description="Range input and identity.">
          <div className="space-y-6">
            <Slider defaultValue={[60]} max={100} step={1} />
            <div className="flex -space-x-2">
              {['AL', 'AT', 'GH', 'KJ'].map((i) => (
                <Avatar key={i} className="ring-2 ring-white">
                  <AvatarFallback>{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <Section title="Alert" description="Inline status messaging.">
        <Alert>
          <IconInfoCircle />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>
            These components are styled with nx: utilities and runtime tokens — the
            app&apos;s own Tailwind config was never touched.
          </AlertDescription>
        </Alert>
      </Section>

      <Section title="Tabs & accordion" description="Disclosure patterns.">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="a">
                <AccordionTrigger>What is @acme/react?</AccordionTrigger>
                <AccordionContent>
                  A design system exported from Nexus, owned and published by the
                  consumer.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>How does theming work?</AccordionTrigger>
                <AccordionContent>
                  Tokens are injected at runtime by the appearance provider — try the
                  palette control in the top bar.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          <TabsContent value="details" className="pt-4 text-sm text-slate-600">
            Every control here comes from <code>@acme/react</code>.
          </TabsContent>
        </Tabs>
      </Section>
    </div>
  );
}
