import { useId, useState } from 'react';

import {
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
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  NativeSelect,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@nxds/react';
import { IconArrowUpRight, IconCheck, IconPlus } from '@tabler/icons-react';

import './component-gallery.css';

function GalleryGroup({ number, title, children }) {
  const id = useId();
  return (
    <section className="component-gallery-group" aria-labelledby={id}>
      <div className="component-gallery-heading nx:text-muted-foreground nx:typography-label-small">
        <span aria-hidden="true" className="nx:text-muted-foreground-subtle">
          {number}
        </span>
        <h2
          id={id}
          className="nx:m-0 nx:font-medium nx:text-inherit nx:typography-label-small"
        >
          {title}
        </h2>
      </div>
      <div className="component-gallery-examples nx:flex nx:min-w-0 nx:flex-col nx:gap-5">
        {children}
      </div>
    </section>
  );
}

function Actions() {
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  return (
    <GalleryGroup number="01" title="Actions">
      <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
        <Button onClick={() => setSaved((value) => !value)}>
          {saved ? (
            <IconCheck aria-hidden="true" />
          ) : (
            <IconPlus aria-hidden="true" />
          )}
          {saved ? 'Saved' : 'Create something'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setFollowing((value) => !value)}
          aria-pressed={following}
        >
          {following ? 'Following' : 'Follow'}
        </Button>
      </div>
      <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
        <Button variant="secondary" onClick={() => setSaved(false)}>
          Reset
        </Button>
        <Button variant="ghost" onClick={() => setFollowing(false)}>
          Dismiss
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Add to saved"
          onClick={() => setSaved(true)}
        >
          <IconPlus aria-hidden="true" />
        </Button>
        <Button disabled>Unavailable</Button>
      </div>
      <div className="nx:flex nx:items-center nx:gap-3">
        <Button size="sm" onClick={() => setSaved(true)}>
          Small
        </Button>
        <Button onClick={() => setSaved(true)}>Default</Button>
        <Button size="lg" onClick={() => setSaved(true)}>
          Large
        </Button>
      </div>
      <p
        className="nx:m-0 nx:text-muted-foreground nx:typography-body-small"
        role="status"
      >
        {saved
          ? 'Saved in this preview.'
          : 'Try a button. Hover, press or use your keyboard.'}
      </p>
    </GalleryGroup>
  );
}

function Inputs() {
  const id = useId();
  return (
    <GalleryGroup number="02" title="Inputs">
      <FieldGroup className="nx:gap-4">
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>Workspace name</FieldLabel>
          <Input id={`${id}-name`} defaultValue="Design collective" />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-role`}>Your role</FieldLabel>
          <NativeSelect id={`${id}-role`} defaultValue="designer">
            <option value="designer">Designer</option>
            <option value="engineer">Engineer</option>
            <option value="founder">Founder</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-note`}>
            A little about your work
          </FieldLabel>
          <Textarea
            id={`${id}-note`}
            rows={2}
            placeholder="What are you making?"
          />
        </Field>
      </FieldGroup>
    </GalleryGroup>
  );
}

function Selection() {
  const id = useId();
  const [level, setLevel] = useState([64]);
  return (
    <GalleryGroup number="03" title="Selection">
      <Tabs defaultValue="design">
        <TabsList aria-label="Preview workspace">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="ship">Ship</TabsTrigger>
        </TabsList>
        <TabsContent
          value="design"
          className="nx:text-muted-foreground nx:typography-body-small"
        >
          A space to explore your next idea.
        </TabsContent>
        <TabsContent
          value="build"
          className="nx:text-muted-foreground nx:typography-body-small"
        >
          Turn the details into working components.
        </TabsContent>
        <TabsContent
          value="ship"
          className="nx:text-muted-foreground nx:typography-body-small"
        >
          Ready for your next release.
        </TabsContent>
      </Tabs>
      <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-5">
        <Field orientation="horizontal" className="nx:w-auto">
          <Checkbox id={`${id}-updates`} defaultChecked />
          <FieldLabel htmlFor={`${id}-updates`}>Updates</FieldLabel>
        </Field>
        <Field orientation="horizontal" className="nx:w-auto">
          <Switch id={`${id}-sync`} defaultChecked />
          <FieldLabel htmlFor={`${id}-sync`}>Auto-sync</FieldLabel>
        </Field>
      </div>
      <RadioGroup
        defaultValue="team"
        aria-label="Workspace visibility"
        className="nx:flex nx:flex-wrap nx:gap-5"
      >
        <Field orientation="horizontal" className="nx:w-auto">
          <RadioGroupItem id={`${id}-team`} value="team" />
          <FieldLabel htmlFor={`${id}-team`}>Team</FieldLabel>
        </Field>
        <Field orientation="horizontal" className="nx:w-auto">
          <RadioGroupItem id={`${id}-public`} value="public" />
          <FieldLabel htmlFor={`${id}-public`}>Public</FieldLabel>
        </Field>
      </RadioGroup>
      <Field>
        <div className="nx:flex nx:items-center nx:justify-between">
          <FieldLabel id={`${id}-level`}>Volume</FieldLabel>
          <span className="nx:text-muted-foreground nx:typography-body-small">
            {level[0]}%
          </span>
        </div>
        <Slider
          aria-labelledby={`${id}-level`}
          value={level}
          onValueChange={setLevel}
          max={100}
          step={1}
        />
      </Field>
    </GalleryGroup>
  );
}

function Feedback() {
  const id = useId();
  const [progress, setProgress] = useState(64);
  return (
    <GalleryGroup number="04" title="Feedback">
      <div className="nx:flex nx:flex-wrap nx:gap-2">
        <Badge>New</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="success">Published</Badge>
        <Badge variant="warning">In review</Badge>
      </div>
      <Alert variant="information">
        <AlertTitle>A little more possibility.</AlertTitle>
        <AlertDescription>
          Your components share the same foundation.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Everything is up to date.</AlertTitle>
      </Alert>
      <div className="nx:flex nx:flex-col nx:gap-2">
        <div className="nx:flex nx:items-center nx:justify-between nx:gap-3">
          <span id={`${id}-progress`} className="nx:typography-label-small">
            Project progress · {progress}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setProgress((value) =>
                value >= 100 ? 0 : Math.min(100, value + 12)
              )
            }
          >
            {progress >= 100 ? 'Start again' : 'Advance'}
          </Button>
        </div>
        <Progress value={progress} aria-labelledby={`${id}-progress`} />
      </div>
    </GalleryGroup>
  );
}

function Content() {
  const [joined, setJoined] = useState(false);
  return (
    <GalleryGroup number="05" title="Content">
      <Item className="nx:p-0">
        <ItemMedia>
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Alex Lee</ItemTitle>
          <ItemDescription>Making things together.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="secondary" fill="outline">
            Designer
          </Badge>
        </ItemActions>
      </Item>
      <Card>
        <CardHeader>
          <CardTitle>Room for your next idea.</CardTitle>
          <CardDescription>
            A shared space for the things you want to make.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="nx:flex nx:items-center nx:gap-3">
            <Avatar size="sm">
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarFallback>SR</AvatarFallback>
            </Avatar>
            <span className="nx:typography-body-small nx:text-muted-foreground">
              {joined ? 'You and 2 others' : '2 people, one workspace'}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant={joined ? 'outline' : 'default'}
            onClick={() => setJoined((value) => !value)}
          >
            {joined ? 'Joined workspace' : 'Join workspace'}
            {joined ? (
              <IconCheck aria-hidden="true" />
            ) : (
              <IconArrowUpRight aria-hidden="true" />
            )}
          </Button>
        </CardFooter>
      </Card>
    </GalleryGroup>
  );
}

function Overlays() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [access, setAccess] = useState('team');
  const [email, setEmail] = useState('alex@');
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [message, setMessage] = useState(
    'Open the popover to try a floating surface.'
  );
  function saveAccess() {
    setMessage(
      access === 'team'
        ? 'Sharing is limited to your team.'
        : 'Anyone with the link can view.'
    );
    setOpen(false);
  }
  return (
    <GalleryGroup number="06" title="Overlays & states">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="nx:self-start">
            Sharing settings
            <IconArrowUpRight aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" side="top" aria-label="Sharing settings">
          <FieldGroup className="nx:gap-4">
            <div>
              <p className="nx:m-0 nx:typography-label-default">
                Who can see your work?
              </p>
              <p className="nx:m-0 nx:mt-1 nx:text-muted-foreground nx:typography-body-small">
                This stays inside the preview.
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor={`${id}-access`}>Link access</FieldLabel>
              <NativeSelect
                id={`${id}-access`}
                value={access}
                onChange={(event) => setAccess(event.target.value)}
              >
                <option value="team">Only your team</option>
                <option value="link">Anyone with the link</option>
              </NativeSelect>
            </Field>
            <Button onClick={saveAccess}>Save preferences</Button>
          </FieldGroup>
        </PopoverContent>
      </Popover>
      <p
        className="nx:m-0 nx:text-muted-foreground nx:typography-body-small"
        role="status"
      >
        {message}
      </p>
      <Separator />
      <Field data-invalid={emailInvalid}>
        <FieldLabel htmlFor={`${id}-error`}>Email address</FieldLabel>
        <Input
          id={`${id}-error`}
          type="email"
          aria-invalid={emailInvalid}
          aria-describedby={`${id}-help`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FieldDescription
          id={`${id}-help`}
          className={
            emailInvalid ? 'nx:text-error-subtle-foreground' : undefined
          }
        >
          {emailInvalid
            ? 'Use a complete email address.'
            : 'Your email looks good.'}
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-disabled`}>Workspace ID</FieldLabel>
        <Input id={`${id}-disabled`} value="workspace_008" disabled />
      </Field>
    </GalleryGroup>
  );
}

export function ComponentGallery() {
  return (
    <div
      className="component-gallery"
      aria-label="Interactive Nexus component gallery"
      role="region"
    >
      <div className="component-gallery-grid">
        <Actions />
        <Inputs />
        <Selection />
        <Feedback />
        <Content />
        <Overlays />
      </div>
    </div>
  );
}
