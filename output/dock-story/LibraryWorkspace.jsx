import { useState } from 'react';

import {
  Button as MuiButton,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Chip,
  LinearProgress,
  Stack,
  Switch as MuiSwitch,
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  TextField,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Button as AntButton,
  Card as AntCard,
  ConfigProvider,
  Input as AntInput,
  Progress,
  Switch as AntSwitch,
  Table as AntTable,
  Tag,
  theme as antTheme,
  Typography as AntTypography,
} from 'antd';

import { Badge } from './comparison-ui/badge';
import { Button } from './comparison-ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './comparison-ui/card';
import { Input } from './comparison-ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './comparison-ui/table';

export const initialMembers = [
  {
    name: 'Alex Morgan',
    email: 'alex@acme.design',
    role: 'Admin',
    status: 'Active',
  },
  {
    name: 'Sam Rivera',
    email: 'sam@acme.design',
    role: 'Editor',
    status: 'Active',
  },
  {
    name: 'Jordan Lee',
    email: 'jordan@acme.design',
    role: 'Editor',
    status: 'Active',
  },
];
const projects = ['Website refresh', 'Mobile experience'];
const muiThemes = {
  light: createTheme({ palette: { mode: 'light' } }),
  dark: createTheme({ palette: { mode: 'dark' } }),
};

function useWorkspace(members) {
  const [query, setQuery] = useState('');
  const [digest, setDigest] = useState(true);
  const [archived, setArchived] = useState(false);
  const filtered = members.filter((member) =>
    `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase())
  );
  return {
    query,
    setQuery,
    digest,
    setDigest,
    archived,
    setArchived,
    filtered,
  };
}

export function MuiWorkspace({ members, mode, children }) {
  const w = useWorkspace(members);
  return (
    <ThemeProvider theme={muiThemes[mode]}>
      <div className="library-workspace" data-library="MUI">
        <div className="workspace-heading" data-external-ui="MUI">
          <div>
            <Typography variant="h5">Acme workspace</Typography>
            <Typography variant="body2" color="text.secondary">
              People, projects, and the work ahead.
            </Typography>
          </div>
          <Chip label="Team plan" color="primary" variant="outlined" />
        </div>
        <div className="workspace-columns">
          <div className="workspace-column" data-external-ui="MUI">
            <MuiCard variant="outlined">
              <MuiCardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Team members</Typography>
                  <TextField
                    size="small"
                    label="Search members"
                    value={w.query}
                    onChange={(event) => w.setQuery(event.target.value)}
                  />
                  <div className="workspace-table">
                    <MuiTable size="small" aria-label="Team members">
                      <MuiTableHead>
                        <MuiTableRow>
                          {['Name', 'Role', 'Status'].map((label) => (
                            <MuiTableCell key={label}>{label}</MuiTableCell>
                          ))}
                        </MuiTableRow>
                      </MuiTableHead>
                      <MuiTableBody>
                        {w.filtered.map((member) => (
                          <MuiTableRow key={member.email}>
                            <MuiTableCell>
                              <Typography variant="body2">
                                {member.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.email}
                              </Typography>
                            </MuiTableCell>
                            <MuiTableCell>{member.role}</MuiTableCell>
                            <MuiTableCell>
                              <Chip
                                size="small"
                                label={member.status}
                                variant="outlined"
                              />
                            </MuiTableCell>
                          </MuiTableRow>
                        ))}
                      </MuiTableBody>
                    </MuiTable>
                  </div>
                  {!w.filtered.length && (
                    <Typography variant="body2">No members found.</Typography>
                  )}
                </Stack>
              </MuiCardContent>
            </MuiCard>
            <MuiCard variant="outlined">
              <MuiCardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Workspace settings</Typography>
                  <div className="workspace-row">
                    <Typography variant="body2">Weekly digest</Typography>
                    <MuiSwitch
                      checked={w.digest}
                      onChange={(_, checked) => w.setDigest(checked)}
                      slotProps={{ input: { 'aria-label': 'Weekly digest' } }}
                    />
                  </div>
                  <Typography variant="body2" color="text.secondary">
                    {w.digest
                      ? 'A weekly summary of your team’s work.'
                      : 'Weekly summaries are paused.'}
                  </Typography>
                </Stack>
              </MuiCardContent>
            </MuiCard>
          </div>
          <div className="workspace-column">
            {children}
            <MuiCard variant="outlined" data-external-ui="MUI">
              <MuiCardContent>
                <Stack spacing={2}>
                  <div className="workspace-row">
                    <Typography variant="h6">Projects</Typography>
                    <MuiButton
                      size="small"
                      onClick={() => w.setArchived(!w.archived)}
                    >
                      {w.archived ? 'Show active' : 'View archive'}
                    </MuiButton>
                  </div>
                  {(w.archived ? ['Brand exploration'] : projects).map(
                    (name, index) => (
                      <Stack key={name} spacing={1}>
                        <Typography variant="body2">{name}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={w.archived ? 100 : 72 - index * 26}
                        />
                      </Stack>
                    )
                  )}
                </Stack>
              </MuiCardContent>
            </MuiCard>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export function AntWorkspace({ members, mode, children }) {
  const w = useWorkspace(members);
  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, member) => (
        <div>
          <AntTypography.Text>{member.name}</AntTypography.Text>
          <br />
          <AntTypography.Text type="secondary">
            {member.email}
          </AntTypography.Text>
        </div>
      ),
    },
    { title: 'Role', dataIndex: 'role' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag>{status}</Tag>,
    },
  ];
  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      }}
    >
      <div className="library-workspace" data-library="Ant Design">
        <div className="workspace-heading" data-external-ui="Ant Design">
          <div>
            <AntTypography.Title level={3}>Acme workspace</AntTypography.Title>
            <AntTypography.Text type="secondary">
              People, projects, and the work ahead.
            </AntTypography.Text>
          </div>
          <Tag color="blue">Team plan</Tag>
        </div>
        <div className="workspace-columns">
          <div className="workspace-column" data-external-ui="Ant Design">
            <AntCard title="Team members">
              <div className="workspace-column">
                <AntInput
                  aria-label="Search members"
                  placeholder="Search members"
                  value={w.query}
                  onChange={(event) => w.setQuery(event.target.value)}
                />
                <AntTable
                  rowKey="email"
                  columns={columns}
                  dataSource={w.filtered}
                  pagination={false}
                  size="small"
                  scroll={{ x: true }}
                />
              </div>
            </AntCard>
            <AntCard title="Workspace settings">
              <div className="workspace-column">
                <div className="workspace-row">
                  <AntTypography.Text>Weekly digest</AntTypography.Text>
                  <AntSwitch
                    aria-label="Weekly digest"
                    checked={w.digest}
                    onChange={w.setDigest}
                  />
                </div>
                <AntTypography.Text type="secondary">
                  {w.digest
                    ? 'A weekly summary of your team’s work.'
                    : 'Weekly summaries are paused.'}
                </AntTypography.Text>
              </div>
            </AntCard>
          </div>
          <div className="workspace-column">
            {children}
            <AntCard
              title="Projects"
              data-external-ui="Ant Design"
              extra={
                <AntButton
                  type="link"
                  size="small"
                  onClick={() => w.setArchived(!w.archived)}
                >
                  {w.archived ? 'Show active' : 'View archive'}
                </AntButton>
              }
            >
              <div className="workspace-column">
                {(w.archived ? ['Brand exploration'] : projects).map(
                  (name, index) => (
                    <div key={name}>
                      <AntTypography.Text>{name}</AntTypography.Text>
                      <Progress
                        percent={w.archived ? 100 : 72 - index * 26}
                        size="small"
                      />
                    </div>
                  )
                )}
              </div>
            </AntCard>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export function ShadcnWorkspace({ members, children }) {
  const w = useWorkspace(members);
  return (
    <div
      className="library-workspace shadcn-workspace"
      data-library="shadcn/ui"
    >
      <div className="workspace-heading" data-external-ui="shadcn/ui">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Acme workspace
          </h2>
          <p className="text-muted-foreground text-sm">
            People, projects, and the work ahead.
          </p>
        </div>
        <Badge variant="outline">Team plan</Badge>
      </div>
      <div className="workspace-columns">
        <div className="workspace-column" data-external-ui="shadcn/ui">
          <Card>
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>Everyone building together.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                aria-label="Search members"
                placeholder="Search members"
                value={w.query}
                onChange={(event) => w.setQuery(event.target.value)}
              />
              <Table aria-label="Team members">
                <TableHeader>
                  <TableRow>
                    {['Name', 'Role', 'Status'].map((label) => (
                      <TableHead key={label}>{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {w.filtered.map((member) => (
                    <TableRow key={member.email}>
                      <TableCell>
                        <div>{member.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{member.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!w.filtered.length && (
                <p className="text-muted-foreground text-sm">
                  No members found.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Workspace settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="workspace-row">
                <span>Weekly digest</span>
                <Button
                  variant={w.digest ? 'default' : 'outline'}
                  size="sm"
                  aria-pressed={w.digest}
                  onClick={() => w.setDigest(!w.digest)}
                >
                  {w.digest ? 'On' : 'Off'}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                {w.digest
                  ? 'A weekly summary of your team’s work.'
                  : 'Weekly summaries are paused.'}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="workspace-column">
          {children}
          <Card data-external-ui="shadcn/ui">
            <CardHeader>
              <div className="workspace-row">
                <CardTitle>Projects</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => w.setArchived(!w.archived)}
                >
                  {w.archived ? 'Show active' : 'View archive'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {(w.archived ? ['Brand exploration'] : projects).map(
                (name, index) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm">{name}</span>
                    <Badge variant="secondary">
                      {w.archived
                        ? 'Archived'
                        : index
                          ? 'In progress'
                          : 'In review'}
                    </Badge>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
