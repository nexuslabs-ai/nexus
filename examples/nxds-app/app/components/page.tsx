import { IconInfoCircle, IconPlus } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/nxds/components/accordion/accordion';
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '@/components/nxds/components/alert/alert';
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/nxds/components/avatar/avatar';
import { Badge } from '@/components/nxds/components/badge/badge';
import { Button } from '@/components/nxds/components/button/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/nxds/components/card/card';
import { Checkbox } from '@/components/nxds/components/checkbox/checkbox';
import { Label } from '@/components/nxds/components/label/label';
import { RadioGroup, RadioGroupItem } from '@/components/nxds/components/radio-group/radio-group';
import { Slider } from '@/components/nxds/components/slider/slider';
import { Switch } from '@/components/nxds/components/switch/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/nxds/components/tabs/tabs';

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
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
    <div className="nx:space-y-6">
      <Section title="Buttons" description="Variants and sizes.">
        <div className="nx:space-y-4">
          <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="dashed">Dashed</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <IconPlus />
            </Button>
            <Button startIcon={<IconPlus />}>New project</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Section>

      <Section title="Badges" description="Status, in solid, light and outline fills.">
        <div className="nx:space-y-3">
          {(['solid', 'light', 'outline'] as const).map((fill) => (
            <div key={fill} className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
              <Badge fill={fill}>Default</Badge>
              <Badge fill={fill} variant="secondary">
                Secondary
              </Badge>
              <Badge fill={fill} variant="success">
                Success
              </Badge>
              <Badge fill={fill} variant="warning">
                Warning
              </Badge>
              <Badge fill={fill} variant="error">
                Error
              </Badge>
              <Badge fill={fill} variant="information">
                Info
              </Badge>
            </div>
          ))}
        </div>
      </Section>

      <div className="nx:grid nx:gap-6 nx:md:grid-cols-2">
        <Section title="Selection controls" description="Checkbox, switch, radio.">
          <div className="nx:space-y-4">
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id="email-notifications" defaultChecked />
              <Label htmlFor="email-notifications">Email notifications</Label>
            </div>
            <div className="nx:flex nx:items-center nx:gap-2">
              <Checkbox id="sms-notifications" disabled />
              <Label htmlFor="sms-notifications">SMS notifications</Label>
            </div>
            <div className="nx:flex nx:items-center nx:gap-2">
              <Switch id="compact-mode" defaultChecked />
              <Label htmlFor="compact-mode">Compact mode</Label>
            </div>
            <RadioGroup defaultValue="week">
              <div className="nx:flex nx:items-center nx:gap-2">
                <RadioGroupItem value="day" id="digest-day" />
                <Label htmlFor="digest-day">Daily digest</Label>
              </div>
              <div className="nx:flex nx:items-center nx:gap-2">
                <RadioGroupItem value="week" id="digest-week" />
                <Label htmlFor="digest-week">Weekly digest</Label>
              </div>
            </RadioGroup>
          </div>
        </Section>

        <Section title="Slider and avatars" description="Range input and identity.">
          <div className="nx:space-y-6">
            <Slider defaultValue={[60]} max={100} step={1} aria-label="Volume" />
            <Slider defaultValue={[20, 80]} max={100} step={5} aria-label="Price range" />
            <AvatarGroup>
              {['AL', 'AT', 'GH', 'KJ'].map((name) => (
                <Avatar key={name}>
                  <AvatarFallback>{name}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </div>
        </Section>
      </div>

      <Section title="Alerts" description="Inline status messaging.">
        <div className="nx:space-y-3">
          {(['default', 'information', 'success', 'warning', 'destructive'] as const).map((variant) => (
            <Alert key={variant} variant={variant}>
              <AlertIcon>
                <IconInfoCircle />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>Scheduled maintenance</AlertTitle>
                <AlertDescription>The API is read-only on Sunday from 02:00 to 03:00 UTC.</AlertDescription>
              </AlertContent>
            </Alert>
          ))}
        </div>
      </Section>

      <Section title="Tabs and accordion" description="Disclosure patterns.">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="nx:pt-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="ownership">
                <AccordionTrigger>Who owns these components?</AccordionTrigger>
                <AccordionContent>
                  This app does. They were copied into components/ and are edited like any other file.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="theming">
                <AccordionTrigger>How does theming work?</AccordionTrigger>
                <AccordionContent>
                  The appearance provider derives every token at runtime. Try the palette control in the top bar.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          <TabsContent value="details" className="nx:pt-4 nx:typography-body-small nx:text-muted-foreground">
            Every control on this page is a copied nxds component.
          </TabsContent>
        </Tabs>
      </Section>
    </div>
  );
}
