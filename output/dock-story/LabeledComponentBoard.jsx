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
  FieldLabel,
  Input,
  Item,
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

import './component-board.css';

function Specimens({ title, children }) {
  const id = useId();
  return (
    <section className="component-board-section" aria-labelledby={id}>
      <h2
        id={id}
        className="nx:m-0 nx:typography-label-small nx:text-muted-foreground"
      >
        {title}
      </h2>
      <div className="nx:flex nx:min-w-0 nx:flex-col nx:gap-4">{children}</div>
    </section>
  );
}

function ActionsAndFeedback() {
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [progress, setProgress] = useState(64);
  function advance() {
    setProgress((value) => (value >= 100 ? 0 : Math.min(100, value + 12)));
  }
  return (
    <div className="component-board-column">
      <Specimens title="Buttons">
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button onClick={() => setSaved((value) => !value)}>
            {saved ? (
              <IconCheck aria-hidden="true" />
            ) : (
              <IconPlus aria-hidden="true" />
            )}
            {saved ? 'Saved' : 'Create'}
          </Button>
          <Button
            variant="outline"
            aria-pressed={following}
            onClick={() => setFollowing((value) => !value)}
          >
            {following ? 'Following' : 'Follow'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Save this example"
            onClick={() => setSaved(true)}
          >
            <IconArrowUpRight aria-hidden="true" />
          </Button>
        </div>
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSaved(false)}>
            Reset
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFollowing(false)}>
            Dismiss
          </Button>
          <Button variant="outline" size="sm" disabled>
            Unavailable
          </Button>
        </div>
      </Specimens>
      <Separator />
      <Specimens title="Feedback & status">
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Badge>New</Badge>
          <Badge variant="secondary">Draft</Badge>
          <Badge variant="success">Published</Badge>
          <Badge variant="warning">In review</Badge>
        </div>
        <Alert variant="information">
          <AlertTitle>A little more possibility.</AlertTitle>
          <AlertDescription>
            One foundation. Every detail connected.
          </AlertDescription>
        </Alert>
        <Alert variant="success">
          <AlertTitle>Your changes are saved.</AlertTitle>
        </Alert>
        <div className="nx:flex nx:flex-col nx:gap-2">
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-3">
            <span className="nx:typography-label-small">
              Progress · {progress}%
            </span>
            <Button variant="ghost" size="sm" onClick={advance}>
              {progress === 100 ? 'Restart' : 'Advance'}
            </Button>
          </div>
          <Progress value={progress} aria-label="Example progress" />
        </div>
      </Specimens>
    </div>
  );
}

function FieldsAndSelection() {
  const id = useId();
  const [level, setLevel] = useState([64]);
  return (
    <div className="component-board-column">
      <Specimens title="Fields">
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
        <Textarea
          aria-label="About your work"
          rows={2}
          placeholder="What are you making?"
        />
      </Specimens>
      <Separator />
      <Specimens title="Selection & adjustment">
        <Tabs defaultValue="design">
          <TabsList aria-label="Work stage">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="ship">Ship</TabsTrigger>
          </TabsList>
          <TabsContent
            value="design"
            className="nx:text-muted-foreground nx:typography-body-small"
          >
            Explore the possibilities.
          </TabsContent>
          <TabsContent
            value="build"
            className="nx:text-muted-foreground nx:typography-body-small"
          >
            Make the details work.
          </TabsContent>
          <TabsContent
            value="ship"
            className="nx:text-muted-foreground nx:typography-body-small"
          >
            Ready for your next release.
          </TabsContent>
        </Tabs>
        <div className="nx:flex nx:flex-wrap nx:gap-4">
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
          className="nx:flex nx:flex-wrap nx:gap-4"
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
          />
        </Field>
      </Specimens>
    </div>
  );
}

function ContentAndOverlay() {
  const id = useId();
  const [joined, setJoined] = useState(false);
  const [open, setOpen] = useState(false);
  const [access, setAccess] = useState('team');
  const [email, setEmail] = useState('alex@');
  const invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <div className="component-board-column">
      <Specimens title="Cards & identity">
        <Card>
          <CardHeader>
            <CardTitle>Room for your next idea.</CardTitle>
            <CardDescription>
              A shared space to make something great.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Item className="nx:p-0">
              <ItemMedia>
                <Avatar>
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Alex Lee</ItemTitle>
                <ItemDescription>Designer · Design collective</ItemDescription>
              </ItemContent>
            </Item>
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
      </Specimens>
      <Separator />
      <Specimens title="Overlays & validation">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="nx:self-start">
              Sharing settings
              <IconArrowUpRight aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="top"
            aria-label="Sharing settings"
          >
            <div className="nx:flex nx:flex-col nx:gap-4">
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
                <FieldDescription>
                  This stays inside the preview.
                </FieldDescription>
              </Field>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </div>
          </PopoverContent>
        </Popover>
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor={`${id}-email`}>Email address</FieldLabel>
          <Input
            id={`${id}-email`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={invalid}
            aria-describedby={`${id}-help`}
          />
          <FieldDescription
            id={`${id}-help`}
            className={invalid ? 'nx:text-error-subtle-foreground' : undefined}
          >
            {invalid
              ? 'Use a complete email address.'
              : 'Your email looks good.'}
          </FieldDescription>
        </Field>
      </Specimens>
    </div>
  );
}

export function LabeledComponentBoard() {
  return (
    <div
      className="component-board"
      role="region"
      aria-label="Interactive Nexus component board"
    >
      <div className="component-board-layout">
        <ActionsAndFeedback />
        <FieldsAndSelection />
        <ContentAndOverlay />
      </div>
    </div>
  );
}
