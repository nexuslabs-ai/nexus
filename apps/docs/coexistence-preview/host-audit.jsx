import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import * as M from '@mui/material';
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import * as A from 'antd';

import './host-audit.css';
const p = new URLSearchParams(location.search),
  host = p.get('host') || 'mui',
  kit = p.get('kit') || 'nexus',
  mode = p.get('mode') || 'dark';
document.documentElement.classList.toggle('dark', mode === 'dark');
if (host === 'ant') await import('antd/dist/reset.css');
const properties = [
  'color',
  'backgroundColor',
  'borderTopColor',
  'borderTopWidth',
  'borderTopStyle',
  'borderRadius',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'paddingTop',
  'paddingLeft',
  'marginTop',
  'marginBottom',
  'display',
  'boxSizing',
  'listStyleType',
  'textDecorationLine',
  'width',
  'height',
  'boxShadow',
  'opacity',
  'visibility',
  'position',
  'zIndex',
  'outlineStyle',
  'outlineColor',
  'outlineWidth',
];
function measure() {
  return Array.from(document.querySelectorAll('[data-case]')).map((el) => ({
    name: el.dataset.case,
    nodes: Array.from(
      el.querySelectorAll(':scope > :not(small), :scope > :not(small) *')
    ).map((x, i) => ({
      tag: x.tagName,
      className: String(x.className),
      index: i,
      styles: Object.fromEntries(
        properties.map((k) => [k, getComputedStyle(x)[k]])
      ),
    })),
  }));
}
const paint = () =>
  new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
function Case({ name, children }) {
  if (p.get('focus') && !name.includes(p.get('focus'))) return null;
  return (
    <section className="audit-case" data-case={name}>
      <small>{name}</small>
      {children}
    </section>
  );
}
function AdditionalCases() {
  const cs = [];
  if (host === 'mui') {
    for (const disabled of [false, true])
      for (const size of ['small', 'medium']) {
        cs.push(
          <Case
            name={`MUI Select ${size} disabled=${disabled}`}
            key={`s${disabled}${size}`}
          >
            <M.Select defaultValue="editor" size={size} disabled={disabled}>
              <M.MenuItem value="editor">Editor</M.MenuItem>
              <M.MenuItem value="viewer">Viewer</M.MenuItem>
            </M.Select>
          </Case>
        );
        cs.push(
          <Case
            name={`MUI Slider ${size} disabled=${disabled}`}
            key={`sl${disabled}${size}`}
          >
            <M.Slider defaultValue={40} size={size} disabled={disabled} />
          </Case>
        );
      }
    for (const variant of ['fullWidth', 'standard', 'scrollable'])
      cs.push(
        <Case key={variant} name={`MUI Tabs ${variant}`}>
          <M.Tabs value={0} variant={variant}>
            <M.Tab label="Overview" />
            <M.Tab label="Team" />
            <M.Tab label="Disabled" disabled />
          </M.Tabs>
        </Case>
      );
    cs.push(
      <Case name="MUI Accordion expanded" key="acc">
        <M.Accordion defaultExpanded>
          <M.AccordionSummary>Details</M.AccordionSummary>
          <M.AccordionDetails>Project details</M.AccordionDetails>
        </M.Accordion>
      </Case>
    );
    cs.push(
      <Case name="MUI Accordion Typography control" key="acc-typography">
        <M.Accordion defaultExpanded>
          <M.AccordionSummary>
            <M.Typography>Details</M.Typography>
          </M.AccordionSummary>
          <M.AccordionDetails>Project details</M.AccordionDetails>
        </M.Accordion>
      </Case>
    );
    cs.push(
      <Case name="MUI Table" key="table">
        <M.Table>
          <M.TableHead>
            <M.TableRow>
              <M.TableCell>Name</M.TableCell>
              <M.TableCell>Role</M.TableCell>
            </M.TableRow>
          </M.TableHead>
          <M.TableBody>
            <M.TableRow selected>
              <M.TableCell>Alex</M.TableCell>
              <M.TableCell>Editor</M.TableCell>
            </M.TableRow>
          </M.TableBody>
        </M.Table>
      </Case>
    );
    cs.push(
      <Case name="MUI Pagination Breadcrumbs List" key="nav">
        <M.Pagination count={4} />
        <M.Breadcrumbs>
          <M.Link href="#">Home</M.Link>
          <M.Typography>Team</M.Typography>
        </M.Breadcrumbs>
        <M.List>
          <M.ListItem>
            <M.ListItemText primary="Alex" secondary="Editor" />
          </M.ListItem>
        </M.List>
      </Case>
    );
    cs.push(
      <Case name="MUI Avatar Badge Divider Skeleton Rating" key="misc">
        <M.Badge badgeContent={4}>
          <M.Avatar>A</M.Avatar>
        </M.Badge>
        <M.Divider />
        <M.Skeleton animation={false} />
        <M.Rating defaultValue={3} />
      </Case>
    );
  } else {
    for (const disabled of [false, true])
      for (const size of ['small', 'middle', 'large'])
        for (const variant of [
          'outlined',
          'filled',
          'borderless',
          'underlined',
        ])
          cs.push(
            <Case
              key={`${disabled}${size}${variant}`}
              name={`Ant Select ${variant} ${size} disabled=${disabled}`}
            >
              <A.Select
                defaultValue="editor"
                size={size}
                variant={variant}
                disabled={disabled}
                options={[
                  { value: 'editor', label: 'Editor' },
                  { value: 'viewer', label: 'Viewer' },
                ]}
              />
            </Case>
          );
    for (const disabled of [false, true])
      cs.push(
        <Case key={`sl${disabled}`} name={`Ant Slider disabled=${disabled}`}>
          <A.Slider defaultValue={40} disabled={disabled} />
        </Case>
      );
    for (const type of ['line', 'card', 'editable-card'])
      cs.push(
        <Case key={type} name={`Ant Tabs ${type}`}>
          <A.Tabs
            type={type}
            items={[
              { key: '1', label: 'Overview', children: 'Details' },
              { key: '2', label: 'Team', children: 'People' },
              { key: '3', label: 'Disabled', disabled: true },
            ]}
          />
        </Case>
      );
    cs.push(
      <Case key="collapse" name="Ant Collapse expanded">
        <A.Collapse
          defaultActiveKey={['1']}
          items={[{ key: '1', label: 'Details', children: 'Project details' }]}
        />
      </Case>
    );
    cs.push(
      <Case key="table" name="Ant Table">
        <A.Table
          pagination={false}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Role', dataIndex: 'role' },
          ]}
          dataSource={[{ key: '1', name: 'Alex', role: 'Editor' }]}
        />
      </Case>
    );
    cs.push(
      <Case key="nav" name="Ant Pagination Breadcrumb Menu">
        <A.Pagination total={40} />
        <A.Breadcrumb items={[{ title: 'Home' }, { title: 'Team' }]} />
        <A.Menu
          selectedKeys={['1']}
          items={[
            { key: '1', label: 'Overview' },
            { key: '2', label: 'Team' },
          ]}
        />
      </Case>
    );
    cs.push(
      <Case key="misc" name="Ant Avatar Badge Divider Skeleton Rate">
        <A.Badge count={4}>
          <A.Avatar>A</A.Avatar>
        </A.Badge>
        <A.Divider />
        <A.Skeleton active={false} paragraph={false} />
        <A.Rate defaultValue={3} />
      </Case>
    );
  }
  return cs;
}
function Cases() {
  const result = [];
  if (host === 'mui') {
    for (const variant of ['text', 'outlined', 'contained'])
      for (const size of ['small', 'medium', 'large'])
        for (const disabled of [false, true])
          result.push(
            <Case
              key={`button-${variant}-${size}-${disabled}`}
              name={`MUI Button ${variant} ${size} disabled=${disabled}`}
            >
              <M.Button variant={variant} size={size} disabled={disabled}>
                Save changes
              </M.Button>
            </Case>
          );
    for (const variant of ['outlined', 'filled', 'standard'])
      for (const size of ['small', 'medium'])
        for (const state of ['default', 'error', 'disabled'])
          result.push(
            <Case
              key={`input-${variant}-${size}-${state}`}
              name={`MUI TextField ${variant} ${size} ${state}`}
            >
              <M.TextField
                label="Name"
                defaultValue="Design team"
                variant={variant}
                size={size}
                error={state === 'error'}
                disabled={state === 'disabled'}
              />
            </Case>
          );
    for (const variant of [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'body1',
      'body2',
      'caption',
      'overline',
    ])
      result.push(
        <Case key={variant} name={`MUI Typography ${variant}`}>
          <M.Typography variant={variant}>Project details</M.Typography>
        </Case>
      );
    for (const checked of [false, true])
      for (const disabled of [false, true])
        result.push(
          <Case
            key={`check-${checked}-${disabled}`}
            name={`MUI choice controls checked=${checked} disabled=${disabled}`}
          >
            <M.Checkbox defaultChecked={checked} disabled={disabled} />
            <M.Switch defaultChecked={checked} disabled={disabled} />
            <M.Radio checked={checked} disabled={disabled} />
          </Case>
        );
    for (const severity of ['success', 'info', 'warning', 'error'])
      result.push(
        <Case key={severity} name={`MUI Alert ${severity}`}>
          <M.Alert severity={severity}>Status update</M.Alert>
        </Case>
      );
    result.push(
      <Case key="other" name="MUI Chip Link Progress Card">
        <M.Chip label="Active" color="primary" />
        <M.Link href="#">Open project</M.Link>
        <M.LinearProgress variant="determinate" value={65} />
        <M.Card>
          <M.CardContent>Project summary</M.CardContent>
        </M.Card>
      </Case>
    );
  } else {
    for (const type of ['default', 'primary', 'dashed', 'link', 'text'])
      for (const size of ['small', 'middle', 'large'])
        for (const state of ['default', 'disabled', 'danger'])
          result.push(
            <Case
              key={`button-${type}-${size}-${state}`}
              name={`Ant Button ${type} ${size} ${state}`}
            >
              <A.Button
                type={type}
                size={size}
                disabled={state === 'disabled'}
                danger={state === 'danger'}
              >
                Save changes
              </A.Button>
            </Case>
          );
    for (const variant of ['outlined', 'filled', 'borderless', 'underlined'])
      for (const size of ['small', 'middle', 'large'])
        for (const state of ['default', 'error', 'disabled'])
          result.push(
            <Case
              key={`input-${variant}-${size}-${state}`}
              name={`Ant Input ${variant} ${size} ${state}`}
            >
              <A.Input
                defaultValue="Design team"
                variant={variant}
                size={size}
                status={state === 'error' ? 'error' : undefined}
                disabled={state === 'disabled'}
              />
            </Case>
          );
    for (const level of [1, 2, 3, 4, 5])
      result.push(
        <Case key={level} name={`Ant Typography Title ${level}`}>
          <A.Typography.Title level={level}>Project details</A.Typography.Title>
        </Case>
      );
    for (const checked of [false, true])
      for (const disabled of [false, true])
        result.push(
          <Case
            key={`check-${checked}-${disabled}`}
            name={`Ant choice controls checked=${checked} disabled=${disabled}`}
          >
            <A.Checkbox defaultChecked={checked} disabled={disabled}>
              Notify me
            </A.Checkbox>
            <A.Switch defaultChecked={checked} disabled={disabled} />
            <A.Radio checked={checked} disabled={disabled}>
              Editor
            </A.Radio>
          </Case>
        );
    for (const type of ['success', 'info', 'warning', 'error'])
      result.push(
        <Case key={type} name={`Ant Alert ${type}`}>
          <A.Alert type={type} title="Status update" />
        </Case>
      );
    result.push(
      <Case key="other" name="Ant Tag Link Progress Card">
        <A.Tag color="blue">Active</A.Tag>
        <A.Typography.Link href="#">Open project</A.Typography.Link>
        <A.Progress percent={65} />
        <A.Card>Project summary</A.Card>
      </Case>
    );
  }
  return (
    <div className="audit-grid">
      {result}
      <AdditionalCases />
      <Case name="Existing theme-token button">
        <button className="host-brand-action">Existing branded action</button>
      </Case>
      <Case name="Existing theme-token card">
        <div className="host-brand-card">Existing branded card</div>
      </Case>
      <Case name="Native form">
        <fieldset>
          <legend>Preferences</legend>
          <label>
            Email <input defaultValue="alex@example.com" />
          </label>
          <button>Continue</button>
          <select defaultValue="editor">
            <option value="editor">Editor</option>
          </select>
        </fieldset>
      </Case>
      <Case name="Native navigation links">
        <nav>
          <a href="#project">Projects</a> · <a href="#team">Team</a>
        </nav>
      </Case>
      <Case name="Native rich content">
        <h2>Workspace guide</h2>
        <p>Follow these steps.</p>
        <ol>
          <li>Open a project</li>
          <li>Invite your team</li>
        </ol>
        <blockquote>Keep everyone in sync.</blockquote>
        <hr />
      </Case>
      <Case name="Native table">
        <table>
          <caption>Team members</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alex</td>
              <td>Editor</td>
            </tr>
          </tbody>
        </table>
      </Case>
    </div>
  );
}
function Audit() {
  const [ready, setReady] = useState(false),
    [report, setReport] = useState(null);
  useEffect(() => {
    let active = true;
    async function run() {
      await document.fonts.ready;
      await paint();
      await new Promise((r) => setTimeout(r, 500));
      const before = measure();
      if (kit === 'shadcn-no-preflight')
        await import('./audit-shadcn-no-preflight.css');
      else if (kit === 'shadcn') await import('./audit-shadcn.css');
      else if (kit === 'nexus') await import('./nexus.css');
      if (!active) return;
      setReady(true);
      await paint();
      await document.fonts.ready;
      await paint();
      await new Promise((r) => setTimeout(r, 500));
      const after = measure();
      const changes = [];
      before.forEach((c, i) =>
        c.nodes.forEach((n, j) =>
          properties.forEach((prop) => {
            const a = after[i]?.nodes[j]?.styles[prop];
            if (a !== n.styles[prop])
              changes.push({
                case: c.name,
                tag: n.tag,
                className: n.className,
                index: j,
                property: prop,
                before: n.styles[prop],
                after: a,
              });
          })
        )
      );
      if (active)
        setReport({
          host,
          kit,
          mode,
          cssVariables: p.get('vars') === '1',
          cases: before.length,
          nodes: before.reduce((a, c) => a + c.nodes.length, 0),
          changes,
        });
    }
    run();
    return () => {
      active = false;
    };
  }, []);
  const content = (
    <>
      <h1>Existing app preservation audit</h1>
      <p>
        {host} · {kit} · {mode}
      </p>
      <pre id="audit-report">
        {report ? JSON.stringify(report) : 'Measuring'}
      </pre>
      <Cases />
    </>
  );
  return ready && kit === 'nexus' ? (
    <NxdsAppearanceProvider
      state={{ ...DEFAULT_NXDS_APPEARANCE, mode }}
      storageKey={false}
      cookieWriteKey={false}
    >
      {content}
    </NxdsAppearanceProvider>
  ) : (
    content
  );
}
createRoot(document.getElementById('root')).render(
  host === 'mui' ? (
    <M.ThemeProvider
      theme={M.createTheme({
        palette: { mode },
        cssVariables: p.get('vars') === '1',
      })}
    >
      <M.CssBaseline />
      <Audit />
    </M.ThemeProvider>
  ) : (
    <A.ConfigProvider
      theme={{
        cssVar: p.get('vars') === '1' ? { key: 'host' } : undefined,
        algorithm:
          mode === 'dark' ? A.theme.darkAlgorithm : A.theme.defaultAlgorithm,
      }}
    >
      <Audit />
    </A.ConfigProvider>
  )
);
