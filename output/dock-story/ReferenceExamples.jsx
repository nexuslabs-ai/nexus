import { useId, useState } from 'react';

import {
  Button as MuiButton,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Chip,
  Divider as MuiDivider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
} from '@nxds/react';
import {
  Avatar,
  Button as AntButton,
  Card as AntCard,
  ConfigProvider,
  Progress,
  Switch as AntSwitch,
  Tag,
  theme as antTheme,
  Typography as AntTypography,
} from 'antd';

import {
  Alert as ShadcnAlert,
  AlertDescription as ShadcnAlertDescription,
  AlertTitle as ShadcnAlertTitle,
} from './comparison-ui/alert';
import { Badge as ShadcnBadge } from './comparison-ui/badge';
import { Button as ShadcnButton } from './comparison-ui/button';
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from './comparison-ui/card';
import { NexusInvite } from './NexusInvite';

import './reference-examples.css';

const muiThemes = {
  light: createTheme({ palette: { mode: 'light' } }),
  dark: createTheme({ palette: { mode: 'dark' } }),
};

function NexusSeats({ seats, onApply }) {
  const id = useId();
  const [saved, setSaved] = useState(false);
  function apply(event) {
    event.preventDefault();
    onApply(Number(new FormData(event.currentTarget).get('seats')));
    setSaved(true);
  }
  return (
    <Card data-comparison-nexus="true" className="nx:gap-4 nx:py-4">
      <CardHeader className="nx:px-4">
        <Badge variant="outline" className="nx:w-fit nx:px-0">
          Added with Nexus
        </Badge>
        <CardTitle>Room for your next hire.</CardTitle>
        <CardDescription>
          Adjust your team’s seats without leaving billing.
        </CardDescription>
      </CardHeader>
      <CardContent className="nx:px-4">
        <form onSubmit={apply} className="nx:flex nx:flex-col nx:gap-4">
          <FieldGroup>
            <Field orientation="responsive">
              <FieldLabel htmlFor={id}>Team seats</FieldLabel>
              <Input
                id={id}
                name="seats"
                type="number"
                min="3"
                max="50"
                defaultValue={seats}
                required
              />
            </Field>
          </FieldGroup>
          <Button type="submit">Preview seat change</Button>
          {saved ? (
            <Alert variant="success" role="status">
              <AlertTitle>Preview updated</AlertTitle>
              <AlertDescription>
                {seats} seats · ${seats * 29} per month. No charge was made.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
              $29 per seat, per month. This is a local preview.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export function MuiBillingExample({ mode, addition }) {
  const [seats, setSeats] = useState(3);
  const [saved, setSaved] = useState(false);
  function saveBilling(event) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <ThemeProvider theme={muiThemes[mode]}>
      <div className="reference-example">
        <header className="reference-heading" data-external-ui="MUI">
          <div>
            <Typography variant="overline" color="text.secondary">
              Acme / Workspace settings
            </Typography>
            <Typography variant="h5" component="h2">
              Billing & subscription
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Everything your team needs to keep building.
            </Typography>
          </div>
          <Chip
            size="small"
            label="Team plan"
            color="primary"
            variant="outlined"
          />
        </header>
        <div className="reference-columns">
          <div className="reference-stack" data-external-ui="MUI">
            <MuiCard variant="outlined">
              <MuiCardContent>
                <Stack spacing={2}>
                  <div>
                    <Typography variant="overline" color="text.secondary">
                      Your subscription
                    </Typography>
                    <Typography variant="h6" component="h3">
                      Team plan
                    </Typography>
                  </div>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'baseline' }}
                  >
                    <Typography variant="h3" component="p">
                      $29
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / member per month
                    </Typography>
                  </Stack>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Unlimited projects and shared libraries
                    </Typography>
                    <Typography variant="body2">
                      Version history and priority support
                    </Typography>
                    <Typography variant="body2">
                      Advanced team permissions
                    </Typography>
                  </Stack>
                  <MuiDivider />
                  <div className="reference-row">
                    <Typography variant="body2">
                      {seats} active seats
                    </Typography>
                    <Typography variant="subtitle2" component="p">
                      ${seats * 29} / month
                    </Typography>
                  </div>
                </Stack>
              </MuiCardContent>
            </MuiCard>
            <MuiCard variant="outlined">
              <MuiCardContent>
                <Stack component="form" spacing={2} onSubmit={saveBilling}>
                  <Typography variant="h6" component="h3">
                    Payment details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Visa ending in 4242 · expires 12/28
                  </Typography>
                  <TextField
                    label="Billing email"
                    name="email"
                    type="email"
                    defaultValue="billing@acme.design"
                    size="small"
                    required
                  />
                  <MuiButton type="submit" variant="outlined">
                    Save changes
                  </MuiButton>
                  {saved && (
                    <Typography
                      role="status"
                      variant="body2"
                      color="success.main"
                    >
                      Billing details saved in this preview.
                    </Typography>
                  )}
                </Stack>
              </MuiCardContent>
            </MuiCard>
            <MuiCard variant="outlined">
              <MuiCardContent>
                <Stack spacing={2}>
                  <div className="reference-row">
                    <Typography variant="subtitle1" component="h3">
                      Workspace usage
                    </Typography>
                    <Chip size="small" label="This month" />
                  </div>
                  <Typography variant="body2" color="text.secondary">
                    24 of 30 shared projects
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={80}
                    aria-label="Shared project usage"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Your plan renews November 1.
                  </Typography>
                </Stack>
              </MuiCardContent>
            </MuiCard>
          </div>
          <div className="reference-stack">
            {addition && <NexusSeats seats={seats} onApply={setSeats} />}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export function AntSettingsExample({ mode, addition }) {
  const [members, setMembers] = useState([
    { name: 'Alex Lee', email: 'alex@acme.design', role: 'Owner' },
    { name: 'Sam Patel', email: 'sam@acme.design', role: 'Editor' },
  ]);
  const [renew, setRenew] = useState(true);
  const [expanded, setExpanded] = useState(false);
  function invite(member) {
    setMembers((current) => [
      ...current.filter((item) => item.email !== member.email),
      member,
    ]);
  }
  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      }}
    >
      <div className="reference-example">
        <header className="reference-heading" data-external-ui="Ant Design">
          <div>
            <AntTypography.Text type="secondary">
              ACME / WORKSPACE SETTINGS
            </AntTypography.Text>
            <AntTypography.Title level={3}>Design team</AntTypography.Title>
            <AntTypography.Text type="secondary">
              Everything your team needs to build together.
            </AntTypography.Text>
          </div>
          <Tag color="blue">Pro workspace</Tag>
        </header>
        <div className="reference-columns">
          <div className="reference-stack" data-external-ui="Ant Design">
            <AntCard title="Workspace usage">
              <div className="reference-stack">
                <AntTypography.Text type="secondary">
                  This month · {members.length + 6} of 10 seats
                </AntTypography.Text>
                <Progress
                  percent={Math.min(100, (members.length + 6) * 10)}
                  aria-label="Workspace seat usage"
                />
                <AntTypography.Text type="secondary">
                  Bring your next collaborator into the workspace.
                </AntTypography.Text>
              </div>
            </AntCard>
            <AntCard
              title="Team members"
              extra={<Tag>{members.length + 6} members</Tag>}
            >
              <div className="reference-stack">
                {members.map((member) => (
                  <div className="reference-row" key={member.email}>
                    <div className="reference-person">
                      <Avatar>
                        {member.name
                          .split(' ')
                          .map((word) => word[0])
                          .slice(0, 2)
                          .join('')}
                      </Avatar>
                      <div>
                        <AntTypography.Text strong>
                          {member.name}
                        </AntTypography.Text>
                        <br />
                        <AntTypography.Text type="secondary">
                          {member.email}
                        </AntTypography.Text>
                      </div>
                    </div>
                    <Tag>{member.role}</Tag>
                  </div>
                ))}
              </div>
            </AntCard>
            <AntCard
              title="Pro plan"
              extra={<AntTypography.Text strong>$240 /mo</AntTypography.Text>}
              data-external-ui="Ant Design"
            >
              <div className="reference-stack">
                <AntTypography.Text type="secondary">
                  Renews November 1 · billed monthly
                </AntTypography.Text>
                <div className="reference-row">
                  <AntTypography.Text>Automatic renewal</AntTypography.Text>
                  <AntSwitch
                    aria-label="Automatic renewal"
                    checked={renew}
                    onChange={setRenew}
                  />
                </div>
                <AntButton onClick={() => setExpanded(!expanded)}>
                  {expanded ? 'Hide plan details' : 'View plan details'}
                </AntButton>
                {expanded && (
                  <AntTypography.Text>
                    10 seats, unlimited projects and priority support.
                  </AntTypography.Text>
                )}
              </div>
            </AntCard>
          </div>
          <div className="reference-stack">
            {addition && <NexusInvite onInvite={invite} />}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

const billingEvents = [
  {
    variant: 'information',
    title: 'Your invoice is ready',
    detail: 'October invoice · $240.00 · 8 seats',
  },
  {
    variant: 'warning',
    title: 'Your card expires soon',
    detail: 'Update your payment method before November 1.',
  },
  {
    variant: 'success',
    title: 'Payment received',
    detail: 'Your September invoice has been paid in full.',
  },
  {
    variant: 'destructive',
    title: 'Backup payment failed',
    detail: 'Your backup card was declined. Try another method.',
  },
];

function NexusBillingActivity() {
  const [reviewed, setReviewed] = useState(false);
  return (
    <Card data-comparison-nexus="true" className="nx:gap-4 nx:py-4">
      <CardHeader className="nx:px-4">
        <Badge variant="outline" className="nx:w-fit nx:px-0">
          Added with Nexus
        </Badge>
        <CardTitle>Every update, in context.</CardTitle>
        <CardDescription>
          Billing activity with clear status and next steps.
        </CardDescription>
      </CardHeader>
      <CardContent className="nx:flex nx:flex-col nx:gap-3 nx:px-4">
        {billingEvents.map((event) => (
          <Alert key={event.variant} variant={event.variant}>
            <AlertTitle>{event.title}</AlertTitle>
            <AlertDescription>{event.detail}</AlertDescription>
          </Alert>
        ))}
        <Button onClick={() => setReviewed(!reviewed)}>
          {reviewed ? 'Show as unread' : 'Mark activity as reviewed'}
        </Button>
        {reviewed && (
          <p
            role="status"
            className="nx:m-0 nx:typography-body-small nx:text-muted-foreground"
          >
            Activity reviewed in this preview.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ShadcnActivityExample({ addition }) {
  const [history, setHistory] = useState(false);
  return (
    <div className="reference-example shadcn-workspace">
      <header className="reference-heading" data-external-ui="shadcn/ui">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide">
            BILLING / ACTIVITY
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Stay on top of your billing.
          </h2>
          <p className="text-muted-foreground text-sm">
            Team workspace · Monthly billing
          </p>
        </div>
        <ShadcnBadge variant="outline">Team plan</ShadcnBadge>
      </header>
      <div className="reference-columns">
        <div className="reference-stack" data-external-ui="shadcn/ui">
          <ShadcnCard>
            <ShadcnCardHeader>
              <ShadcnCardTitle>Current subscription</ShadcnCardTitle>
              <ShadcnCardDescription>
                A shared space for your best work.
              </ShadcnCardDescription>
            </ShadcnCardHeader>
            <ShadcnCardContent className="flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold">$240</span>
                <span className="text-muted-foreground text-sm">/ month</span>
              </div>
              <div className="reference-row">
                <span className="text-sm">Team members</span>
                <ShadcnBadge variant="secondary">8 seats</ShadcnBadge>
              </div>
              <div className="reference-row">
                <span className="text-sm">Next invoice</span>
                <span className="text-muted-foreground text-sm">
                  November 1
                </span>
              </div>
              <ShadcnAlert role="note">
                <ShadcnAlertTitle>Monthly billing is active</ShadcnAlertTitle>
                <ShadcnAlertDescription>
                  Your plan renews automatically.
                </ShadcnAlertDescription>
              </ShadcnAlert>
            </ShadcnCardContent>
          </ShadcnCard>
          <ShadcnCard>
            <ShadcnCardHeader>
              <ShadcnCardTitle>Payment method</ShadcnCardTitle>
              <ShadcnCardDescription>
                Visa ending in 4242 · expires 12/28
              </ShadcnCardDescription>
            </ShadcnCardHeader>
            <ShadcnCardContent className="flex flex-col gap-4">
              <ShadcnButton
                variant="outline"
                onClick={() => setHistory(!history)}
              >
                {history ? 'Hide payment history' : 'View payment history'}
              </ShadcnButton>
              {history && (
                <div role="status" className="flex flex-col gap-2 text-sm">
                  <div className="reference-row">
                    <span>September 1</span>
                    <span>$240.00 · Paid</span>
                  </div>
                  <div className="reference-row">
                    <span>August 1</span>
                    <span>$240.00 · Paid</span>
                  </div>
                </div>
              )}
            </ShadcnCardContent>
          </ShadcnCard>
        </div>
        <div className="reference-stack">
          {addition && <NexusBillingActivity />}
        </div>
      </div>
    </div>
  );
}
