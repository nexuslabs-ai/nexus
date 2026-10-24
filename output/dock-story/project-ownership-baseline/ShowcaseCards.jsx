import { useEffect, useId, useRef, useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Bubble,
  BubbleContent,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Checkbox,
  ChoiceCard,
  ChoiceCardContent,
  ChoiceCardDescription,
  ChoiceCardTitle,
  ChoiceRow,
  ChoiceRowContent,
  ChoiceRowDescription,
  ChoiceRowTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Label,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
  NativeSelect,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@nxds/react';
import {
  IconArrowUpRight,
  IconFile,
  IconPlus,
  IconSend,
} from '@tabler/icons-react';
import { Bar, BarChart, XAxis } from 'recharts';

export function ShowcaseCard({ title, description, children, className = '' }) {
  const id = useId();
  return (
    <Card
      className={`showcase-card ${className}`}
      role="region"
      aria-labelledby={id}
    >
      <div className="showcase-body nx:p-container">
        <CardHeader className="showcase-heading nx:p-0">
          <CardTitle asChild>
            <h2 id={id}>{title}</h2>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        {children}
      </div>
    </Card>
  );
}

function Person({ name, detail, children, className = '' }) {
  return (
    <Item size="sm" className={`nexus-showcase-person nx:p-0 ${className}`}>
      <ItemMedia>
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback>
            {name
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{name}</ItemTitle>
        {detail && (
          <ItemDescription className="nexus-showcase-person-detail">
            {detail}
          </ItemDescription>
        )}
      </ItemContent>
      {children && (
        <ItemActions className="nexus-showcase-person-actions">
          {children}
        </ItemActions>
      )}
    </Item>
  );
}

export function ProjectCard() {
  const id = useId();
  const [created, setCreated] = useState('');
  function createProject(event) {
    event.preventDefault();
    setCreated(new FormData(event.currentTarget).get('project'));
  }
  return (
    <ShowcaseCard
      className="showcase-project"
      title="Create a project"
      description="Give your next idea a place to grow."
    >
      <form
        className="showcase-stack nx:gap-container"
        onSubmit={createProject}
      >
        <Field className="nexus-showcase-field">
          <FieldLabel htmlFor={`${id}-name`}>Project name</FieldLabel>
          <Input
            id={`${id}-name`}
            name="project"
            defaultValue="Website refresh"
            required
          />
        </Field>
        <Field className="nexus-showcase-field">
          <FieldLabel htmlFor={`${id}-team`}>Workspace</FieldLabel>
          <NativeSelect
            id={`${id}-team`}
            name="workspace"
            defaultValue="Design team"
          >
            <option>Design team</option>
            <option>Engineering</option>
            <option>Personal projects</option>
          </NativeSelect>
        </Field>
        <Field className="showcase-expanded nexus-showcase-field showcase-project-brief">
          <FieldLabel htmlFor={`${id}-brief`}>Project brief</FieldLabel>
          <Textarea
            id={`${id}-brief`}
            name="brief"
            rows={4}
            defaultValue="A clearer home for our product. Bring the new components, content and navigation together."
          />
        </Field>
        <FieldSet className="showcase-expanded nx:m-0 nx:min-w-0 nx:border-0 nx:p-0 showcase-project-template">
          <FieldLegend variant="label">Starting point</FieldLegend>
          <RadioGroup
            defaultValue="website"
            name="template"
            className="showcase-templates"
          >
            {[
              [
                'website',
                'Product website',
                'Pages, content and a launch checklist',
              ],
              [
                'application',
                'Application',
                'Views, workflows and shared components',
              ],
              ['blank', 'Blank project', 'Start with a clean workspace'],
            ].map(([value, label, detail]) => (
              <ChoiceCard key={value} htmlFor={`${id}-${value}`}>
                <RadioGroupItem
                  value={value}
                  id={`${id}-${value}`}
                  aria-labelledby={`${id}-${value}-label`}
                  aria-describedby={`${id}-${value}-description`}
                />
                <ChoiceCardContent>
                  <ChoiceCardTitle id={`${id}-${value}-label`}>
                    {label}
                  </ChoiceCardTitle>
                  <ChoiceCardDescription id={`${id}-${value}-description`}>
                    {detail}
                  </ChoiceCardDescription>
                </ChoiceCardContent>
              </ChoiceCard>
            ))}
          </RadioGroup>
        </FieldSet>
        <Field className="nexus-showcase-field">
          <FieldLabel htmlFor={`${id}-date`}>Target date</FieldLabel>
          <Input
            id={`${id}-date`}
            type="date"
            name="date"
            defaultValue="2026-11-12"
          />
        </Field>
        <FieldSet className="showcase-expanded nx:m-0 nx:min-w-0 nx:border-0 nx:p-0 showcase-project-team">
          <FieldLegend variant="label">Project team</FieldLegend>
          <FieldGroup className="nx:gap-3">
            {['Sam Rivera', 'Jordan Lee'].map((name, index) => (
              <ChoiceRow htmlFor={`${id}-member-${index}`} key={name}>
                <Checkbox
                  id={`${id}-member-${index}`}
                  name="members"
                  value={name}
                  aria-labelledby={`${id}-member-title-${index}`}
                  aria-describedby={`${id}-member-detail-${index}`}
                  defaultChecked
                />
                <ChoiceRowContent>
                  <ChoiceRowTitle id={`${id}-member-title-${index}`}>
                    {name}
                  </ChoiceRowTitle>
                  <ChoiceRowDescription id={`${id}-member-detail-${index}`}>
                    {index === 0 ? 'Product designer' : 'Engineer'}
                  </ChoiceRowDescription>
                </ChoiceRowContent>
              </ChoiceRow>
            ))}
          </FieldGroup>
        </FieldSet>
        <ChoiceRow htmlFor={`${id}-private`}>
          <Checkbox
            id={`${id}-private`}
            aria-labelledby={`${id}-private-label`}
            defaultChecked
          />
          <ChoiceRowTitle id={`${id}-private-label`}>
            Keep this project private
          </ChoiceRowTitle>
        </ChoiceRow>
        <Button type="submit">
          <IconPlus data-prototype-icon="true" size={16} /> Create project
        </Button>
        <p className="showcase-status" role="status">
          {created
            ? `${created} is ready in this demo.`
            : 'Try it. Everything stays in this preview.'}
        </p>
      </form>
    </ShowcaseCard>
  );
}

const activity = {
  week: {
    total: '1,284',
    change: '+12.8%',
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    values: [48, 72, 56, 89, 64, 100, 82],
  },
  month: {
    total: '5,426',
    change: '+18.4%',
    labels: ['01', '05', '09', '13', '17', '21', '25'],
    values: [37, 49, 68, 53, 79, 91, 100],
  },
};

export function ActivityCard() {
  return (
    <ShowcaseCard
      className="showcase-activity"
      title="Workspace activity"
      description="Projects moving forward"
    >
      <Tabs defaultValue="week" className="showcase-activity-tabs">
        <TabsList size="sm" aria-label="Activity period">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
        {Object.entries(activity).map(([period, data]) => (
          <TabsContent
            value={period}
            key={period}
            className="showcase-activity-period"
          >
            <div className="showcase-metric">
              <strong>{data.total}</strong>
              <Badge variant="success" fill="light">
                <IconArrowUpRight data-prototype-icon="true" size={14} />
                {data.change}
              </Badge>
            </div>
            <ChartContainer
              className="showcase-chart nx:aspect-auto"
              config={{
                activity: {
                  label: 'Activity',
                  color: 'var(--nx-color-chart-categorical-1)',
                },
              }}
              role="img"
              aria-label={`${period === 'week' ? 'Weekly' : 'Monthly'} activity index: ${data.values.join(', ')}`}
            >
              <BarChart
                data={data.values.map((value, index) => ({
                  day: data.labels[index],
                  activity: value,
                }))}
                accessibilityLayer
              >
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="activity"
                  fill="var(--color-activity)"
                  radius={4}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
            <dl className="showcase-expanded showcase-chart-summary">
              <div>
                <dt>Completed</dt>
                <dd>{period === 'week' ? '48' : '196'}</dd>
              </div>
              <div>
                <dt>In progress</dt>
                <dd>{period === 'week' ? '12' : '24'}</dd>
              </div>
              <div>
                <dt>Contributors</dt>
                <dd>{period === 'week' ? '8' : '16'}</dd>
              </div>
            </dl>
          </TabsContent>
        ))}
      </Tabs>
    </ShowcaseCard>
  );
}

export function TeamCard() {
  const id = useId();
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState('');
  function invite(event) {
    event.preventDefault();
    setInvited(new FormData(event.currentTarget).get('email'));
    setInviting(false);
  }
  return (
    <ShowcaseCard
      className="showcase-team"
      title="Team access"
      description="Choose who can do what."
    >
      <div className="showcase-stack nx:gap-container">
        {[
          'Alex Morgan',
          'Sam Rivera',
          'Jordan Lee',
          'Jamie Park',
          'Taylor Chen',
        ].map((name, index) => (
          <Person
            className={index > 2 ? 'showcase-expanded' : ''}
            key={name}
            name={name}
            detail={
              [
                'Design lead',
                'Product designer',
                'Engineer',
                'Content designer',
                'Product manager',
              ][index]
            }
          >
            <NativeSelect
              size="sm"
              aria-label={`Role for ${name}`}
              defaultValue={index === 0 ? 'Admin' : 'Editor'}
            >
              <option>Admin</option>
              <option>Editor</option>
              <option>Viewer</option>
            </NativeSelect>
          </Person>
        ))}
        <div className="showcase-expanded showcase-team-permissions">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor={`${id}-invites`}>
                Member invitations
              </FieldLabel>
              <FieldDescription id={`${id}-invites-description`}>
                Let members invite teammates.
              </FieldDescription>
            </FieldContent>
            <Switch
              id={`${id}-invites`}
              aria-describedby={`${id}-invites-description`}
              defaultChecked
            />
          </Field>
        </div>
        {inviting ? (
          <form className="showcase-stack nx:gap-container" onSubmit={invite}>
            <Field>
              <FieldLabel htmlFor={id}>Email address</FieldLabel>
              <Input
                id={id}
                name="email"
                type="email"
                placeholder="teammate@example.com"
                required
              />
            </Field>
            <div className="showcase-actions">
              <Button size="sm" type="submit">
                Add to team
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setInviting(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" onClick={() => setInviting(true)}>
            <IconPlus data-prototype-icon="true" size={16} />
            Invite a teammate
          </Button>
        )}
        {invited && (
          <p className="showcase-status" role="status">
            {invited} added to this demo. No invitation sent.
          </p>
        )}
      </div>
    </ShowcaseCard>
  );
}

export function ConversationCard() {
  const id = useId();
  const log = useRef(null);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (messages.length) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);
  function sendMessage(event) {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get('message').trim();
    if (!text) return;
    setMessages((current) => [...current, text]);
    event.currentTarget.reset();
  }
  return (
    <ShowcaseCard
      className="showcase-conversation"
      title="Design review"
      description="Design review · 3 people"
    >
      <MessageGroup
        ref={log}
        announce
        aria-label="Design review conversation"
        aria-live="polite"
        className="nexus-showcase-message-scroll"
      >
        <Message>
          <MessageAvatar
            className="nexus-showcase-message-avatar"
            aria-hidden="true"
          >
            <AvatarFallback>SR</AvatarFallback>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Sam Rivera</MessageHeader>
            <Bubble>
              <BubbleContent>
                The new direction is ready for a look.
              </BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble variant="outline">
              <BubbleContent>
                Love the quieter navigation. Let’s ship it.
              </BubbleContent>
            </Bubble>
            <MessageFooter>You · 10:42</MessageFooter>
          </MessageContent>
        </Message>
        <Message className="showcase-expanded nexus-showcase-message">
          <MessageAvatar
            className="nexus-showcase-message-avatar"
            aria-hidden="true"
          >
            <AvatarFallback>JL</AvatarFallback>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Jordan Lee</MessageHeader>
            <Bubble>
              <BubbleContent>
                The components are ready in both themes. I’ll check the smaller
                layouts next.
              </BubbleContent>
            </Bubble>
            <MessageFooter>10:44</MessageFooter>
          </MessageContent>
        </Message>
        <Message
          align="end"
          className="showcase-expanded nexus-showcase-message"
        >
          <MessageContent>
            <Bubble variant="outline">
              <BubbleContent>
                Perfect. Let’s review it together this afternoon.
              </BubbleContent>
            </Bubble>
            <MessageFooter>You · 10:45</MessageFooter>
          </MessageContent>
        </Message>
        {messages.map((message, index) => (
          <Message align="end" key={index}>
            <MessageContent>
              <Bubble variant="outline">
                <BubbleContent>{message}</BubbleContent>
              </Bubble>
              <MessageFooter>You · just now</MessageFooter>
            </MessageContent>
          </Message>
        ))}
      </MessageGroup>
      <form className="showcase-composer" onSubmit={sendMessage}>
        <Label className="story-visually-hidden" htmlFor={id}>
          Message to the design team
        </Label>
        <Input
          id={id}
          name="message"
          placeholder="Add your thoughts…"
          required
        />
        <Button type="submit" size="icon" aria-label="Send demo message">
          <IconSend data-prototype-icon="true" size={18} />
        </Button>
      </form>
    </ShowcaseCard>
  );
}

export function PreferencesCard() {
  const id = useId();
  const [volume, setVolume] = useState([65]);
  return (
    <ShowcaseCard
      className="showcase-preferences"
      title="Notifications"
      description="Choose what reaches you."
    >
      <div className="showcase-stack nx:gap-container">
        {['Mentions and replies', 'Project updates', 'Weekly digest'].map(
          (label, index) => (
            <Field orientation="horizontal" key={label}>
              <FieldContent>
                <FieldLabel htmlFor={`${id}-${index}`}>{label}</FieldLabel>
                <FieldDescription
                  className="showcase-expanded"
                  id={`${id}-${index}-description`}
                >
                  {
                    [
                      'When someone needs your attention.',
                      'Progress, milestones and shared work.',
                      'A weekly summary of your workspace.',
                    ][index]
                  }
                </FieldDescription>
              </FieldContent>
              <Switch
                id={`${id}-${index}`}
                aria-describedby={`${id}-${index}-description`}
                defaultChecked={index < 2}
              />
            </Field>
          )
        )}
        <FieldSet className="showcase-expanded nx:m-0 nx:min-w-0 nx:border-0 nx:p-0 showcase-delivery">
          <FieldLegend variant="label">Delivery</FieldLegend>
          <div className="showcase-actions">
            <ChoiceRow htmlFor={`${id}-email`}>
              <Checkbox
                id={`${id}-email`}
                aria-labelledby={`${id}-email-label`}
                defaultChecked
              />
              <ChoiceRowTitle id={`${id}-email-label`}>Email</ChoiceRowTitle>
            </ChoiceRow>
            <ChoiceRow htmlFor={`${id}-push`}>
              <Checkbox
                id={`${id}-push`}
                aria-labelledby={`${id}-push-label`}
                defaultChecked
              />
              <ChoiceRowTitle id={`${id}-push-label`}>Push</ChoiceRowTitle>
            </ChoiceRow>
          </div>
        </FieldSet>
        <Field className="showcase-expanded nexus-showcase-field showcase-quiet">
          <FieldLabel htmlFor={`${id}-quiet`}>Quiet hours</FieldLabel>
          <NativeSelect id={`${id}-quiet`} defaultValue="off">
            <option value="off">No quiet hours</option>
            <option value="night">10:00 PM – 8:00 AM</option>
            <option value="evening">6:00 PM – 9:00 AM</option>
          </NativeSelect>
        </Field>
        <div className="showcase-volume showcase-stack">
          <Separator className="showcase-rule" />
          <div className="showcase-between">
            <Label htmlFor={`${id}-volume`}>Notification volume</Label>
            <output>{volume[0]}%</output>
          </div>
          <Slider
            id={`${id}-volume`}
            aria-label="Notification volume"
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={5}
          />
        </div>
      </div>
    </ShowcaseCard>
  );
}

const initialTasks = [
  'Explore the direction',
  'Review the components',
  'Polish the interactions',
  'Share with the team',
];
export function TasksCard() {
  const id = useId();
  const [done, setDone] = useState([true, true, false, false]);
  const completed = done.filter(Boolean).length;
  function toggleTask(index, checked) {
    setDone((current) =>
      current.map((value, i) => (i === index ? checked : value))
    );
  }
  return (
    <ShowcaseCard
      title="Project checklist"
      description="Website refresh · This week"
    >
      <div className="showcase-metric">
        <strong>
          {completed}
          <span> / 4</span>
        </strong>
        <Badge variant="secondary" fill="light">
          In progress
        </Badge>
      </div>
      <Progress
        value={completed * 25}
        aria-label={`${completed} of 4 tasks complete`}
      />
      <div className="showcase-task-list">
        {initialTasks.map((task, index) => (
          <ChoiceRow htmlFor={`${id}-${index}`} key={task}>
            <Checkbox
              id={`${id}-${index}`}
              checked={done[index]}
              aria-labelledby={`${id}-${index}-label`}
              onCheckedChange={(checked) => toggleTask(index, checked === true)}
            />
            <ChoiceRowTitle
              id={`${id}-${index}-label`}
              className={
                done[index]
                  ? 'nx:line-through nx:text-muted-foreground'
                  : undefined
              }
            >
              {task}
            </ChoiceRowTitle>
          </ChoiceRow>
        ))}
      </div>
      <Separator className="showcase-rule" />
      <Person name="Alex Morgan" detail="Due November 12" />
    </ShowcaseCard>
  );
}

const mail = [
  {
    name: 'Sam Rivera',
    title: 'A fresh direction',
    body: 'The first pass is ready. I’ve kept the navigation quiet and given the work more room. Let me know what you think.',
    time: '10:42',
  },
  {
    name: 'Jordan Lee',
    title: 'Ready for review',
    body: 'The components are in place. Keyboard support and both themes are ready for a final look.',
    time: '09:18',
  },
  {
    name: 'Alex Morgan',
    title: 'Friday catch-up',
    body: 'Let’s walk through the latest work together on Friday. Bring any open questions and ideas for the next release.',
    time: 'Yesterday',
  },
];
export function InboxCard() {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');
  return (
    <ShowcaseCard
      title="Inbox"
      description="A few conversations worth your time."
    >
      <Input
        aria-label="Search inbox"
        placeholder="Search conversations…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ItemGroup className="nx:my-5 nx:gap-2">
        {mail.map(
          (message, index) =>
            (!query ||
              `${message.name} ${message.title}`
                .toLowerCase()
                .includes(query.toLowerCase())) && (
              <Item
                asChild
                size="sm"
                variant={selected === index ? 'muted' : 'default'}
                key={message.title}
                onClick={() => setSelected(index)}
                aria-pressed={selected === index}
              >
                <button
                  type="button"
                  className="nx:text-start nx:cursor-pointer"
                >
                  <ItemContent>
                    <ItemTitle>{message.name}</ItemTitle>
                    <ItemDescription>{message.title}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="nx:typography-label-small nx:text-muted-foreground">
                      {message.time}
                    </span>
                  </ItemActions>
                </button>
              </Item>
            )
        )}
      </ItemGroup>
      <Separator className="showcase-rule" />
      <Person name={mail[selected].name} detail={mail[selected].time} />
      <h3>{mail[selected].title}</h3>
      <p className="showcase-prose">{mail[selected].body}</p>
    </ShowcaseCard>
  );
}

export function ComposeCard() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  function saveDraft(event) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <ShowcaseCard
      title="New message"
      description="A draft for your next conversation."
    >
      <form className="showcase-stack nx:gap-container" onSubmit={saveDraft}>
        <Field className="nexus-showcase-field">
          <FieldLabel htmlFor={`${id}-to`}>To</FieldLabel>
          <Input
            id={`${id}-to`}
            type="email"
            name="to"
            defaultValue="sam@example.com"
            required
          />
        </Field>
        <Field className="nexus-showcase-field">
          <FieldLabel htmlFor={`${id}-message`}>Message</FieldLabel>
          <Textarea
            id={`${id}-message`}
            name="message"
            defaultValue="Thanks for sharing. This is looking great."
            rows={3}
            required
          />
        </Field>
        <Button type="submit" variant="outline">
          Save draft
        </Button>
        <p className="showcase-status" role="status">
          {saved
            ? 'Draft saved in this preview.'
            : 'Nothing is sent from this demo.'}
        </p>
      </form>
    </ShowcaseCard>
  );
}

export function FilesCard() {
  const [selected, setSelected] = useState('');
  return (
    <ShowcaseCard
      title="Shared files"
      description="Shared with the design team"
    >
      <div className="showcase-stack nx:gap-container">
        {[
          ['Brand guidelines.pdf', '2.4 MB'],
          ['Component inventory.csv', '128 KB'],
          ['Launch checklist.md', '12 KB'],
        ].map(([name, size]) => (
          <Item variant="outline" size="sm" key={name}>
            <ItemMedia variant="icon">
              <IconFile data-prototype-icon="true" size={20} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{name}</ItemTitle>
              <ItemDescription>{size}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Select ${name}`}
                onClick={() => setSelected(name)}
              >
                <IconArrowUpRight data-prototype-icon="true" size={16} />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </div>
      <p className="showcase-status" role="status">
        {selected
          ? `${selected} selected. Sample file only.`
          : 'Three files · Updated today'}
      </p>
    </ShowcaseCard>
  );
}

export function BillingCard() {
  const [period, setPeriod] = useState('monthly');
  const [reviewing, setReviewing] = useState(false);
  return (
    <ShowcaseCard title="Workspace plan" description="Your workspace plan">
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList aria-label="Billing period" size="sm">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          <p className="showcase-price">
            $24 <span>/ person / month</span>
          </p>
        </TabsContent>
        <TabsContent value="yearly">
          <p className="showcase-price">
            $20 <span>/ person / month</span>
          </p>
          <Badge variant="success" fill="light">
            Billed yearly · Save 17%
          </Badge>
        </TabsContent>
      </Tabs>
      <div className="showcase-stack nx:gap-container">
        <div className="showcase-between">
          <span>Team seats</span>
          <strong>3 of 5</strong>
        </div>
        <Progress value={60} aria-label="3 of 5 team seats used" />
        <div className="showcase-between">
          <span>Storage</span>
          <strong>6.4 of 20 GB</strong>
        </div>
        <Progress value={32} aria-label="6.4 of 20 gigabytes used" />
        <Button
          variant="outline"
          onClick={() => setReviewing((value) => !value)}
        >
          {reviewing ? 'Close plan details' : 'Review plan'}
        </Button>
        {reviewing && (
          <p className="showcase-status" role="status">
            5 seats, 20 GB storage, unlimited projects. Demo only; no payment is
            taken.
          </p>
        )}
      </div>
    </ShowcaseCard>
  );
}

export function TransactionsCard() {
  const [filter, setFilter] = useState('All');
  const rows = [
    ['Studio North', '$2,400', 'Paid'],
    ['Forma Labs', '$1,850', 'Pending'],
    ['Fieldwork', '$3,200', 'Paid'],
  ];
  return (
    <ShowcaseCard title="Invoices" description="Recent invoices">
      <NativeSelect
        size="sm"
        aria-label="Filter invoice status"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      >
        <option>All</option>
        <option>Paid</option>
        <option>Pending</option>
      </NativeSelect>
      <div className="showcase-table-wrap">
        <Table density="compact">
          <caption className="story-visually-hidden">Sample invoices</caption>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows
              .filter((row) => filter === 'All' || row[2] === filter)
              .map(([name, amount, status]) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={status === 'Paid' ? 'success' : 'warning'}
                      fill="light"
                    >
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </ShowcaseCard>
  );
}

export function ContactCard() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  function saveContact(event) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <ShowcaseCard
      title="Contact details"
      description="Studio North · New opportunity"
    >
      <Person name="Jamie Park" detail="Head of design" />
      <Separator className="showcase-rule" />
      <form className="showcase-stack nx:gap-container" onSubmit={saveContact}>
        <Field className="nexus-showcase-field">
          <FieldLabel htmlFor={`${id}-name`}>Full name</FieldLabel>
          <Input
            id={`${id}-name`}
            name="name"
            defaultValue="Jamie Park"
            required
          />
        </Field>
        <Field className="nexus-showcase-field">
          <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            defaultValue="jamie@example.com"
            required
          />
        </Field>
        <Field className="nexus-showcase-field">
          <FieldLabel htmlFor={`${id}-stage`}>Stage</FieldLabel>
          <NativeSelect id={`${id}-stage`} defaultValue="Discovery">
            <option>Discovery</option>
            <option>Proposal</option>
            <option>Won</option>
          </NativeSelect>
        </Field>
        <Button type="submit">Save contact</Button>
        {saved && (
          <p className="showcase-status" role="status">
            Contact updated in this preview.
          </p>
        )}
      </form>
    </ShowcaseCard>
  );
}

export function PipelineCard() {
  const [stage, setStage] = useState('Discovery');
  const totals = {
    Discovery: ['$12,400', 35],
    Proposal: ['$8,200', 65],
    Won: ['$24,600', 100],
  };
  return (
    <ShowcaseCard title="Sales pipeline" description="Your opportunities">
      <div className="showcase-actions">
        {Object.keys(totals).map((label) => (
          <Button
            key={label}
            size="sm"
            variant={stage === label ? 'secondary' : 'ghost'}
            aria-pressed={stage === label}
            onClick={() => setStage(label)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="showcase-metric">
        <strong>{totals[stage][0]}</strong>
      </div>
      <Progress
        value={totals[stage][1]}
        aria-label={`${stage} pipeline progress`}
      />
      <p className="showcase-prose">Total value in {stage.toLowerCase()}.</p>
    </ShowcaseCard>
  );
}

export function NotesCard() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  function saveNote(event) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <ShowcaseCard title="Team notes" description="A note for what comes next">
      <form className="showcase-stack nx:gap-container" onSubmit={saveNote}>
        <Field>
          <FieldLabel htmlFor={id}>Team note</FieldLabel>
          <Textarea
            id={id}
            rows={4}
            defaultValue="Keep the experience simple. Make the details count."
            onChange={() => setSaved(false)}
          />
        </Field>
        <Button variant="outline" type="submit">
          Save note
        </Button>
        <p className="showcase-status" role="status">
          {saved ? 'Note saved in this preview.' : 'Only visible in this demo.'}
        </p>
      </form>
    </ShowcaseCard>
  );
}
