import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Button as MuiButton,
  createTheme,
  CssBaseline,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import { Button as NexusButton } from '@nxds/react';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import {
  Button as AntButton,
  ConfigProvider,
  Input,
  theme as antTheme,
  Typography as AntTypography,
} from 'antd';

import { invitationAppearance } from '../app/_components/home-page/coexistence-appearance.mjs';
import { cssConflictExamples } from '../app/_components/home-page/css-conflict-examples.mjs';

import { ComparisonExample, exampleNames } from './ComparisonExample';
import { Button as ShadcnButton } from './ui/button';
import { VerifiedConflictExample } from './VerifiedConflictExample';

import './comparison-host.css';

const params = new URLSearchParams(location.search);
const library = params.get('library') === 'Ant Design' ? 'Ant Design' : 'MUI';
const mode = params.get('mode') === 'light' ? 'light' : 'dark';
const integration = params.get('integration') === 'shadcn' ? 'shadcn' : 'nexus';
const run = params.get('run');
const example = Object.hasOwn(
  { ...exampleNames, ...cssConflictExamples },
  params.get('example')
)
  ? params.get('example')
  : null;
const actionLabel =
  {
    billing: 'Upgrade plan',
    article: 'Contact support',
    team: 'Send invitation',
    product: 'Place order',
  }[example] || 'Invite teammate';
document.documentElement.classList.toggle('dark', mode === 'dark');
if (library === 'Ant Design') await import('antd/dist/reset.css');
const preset = invitationAppearance(library, mode);
const appearance = {
  ...DEFAULT_NXDS_APPEARANCE,
  ...preset,
  prefs: { ...DEFAULT_NXDS_APPEARANCE.prefs, ...preset.prefs },
};
const targets = {
  Page: [
    'body',
    ['backgroundColor', 'color', 'fontFamily', 'fontSize', 'lineHeight'],
  ],
  'Host title': [
    '[data-probe="title"]',
    ['fontSize', 'fontWeight', 'marginTop', 'marginBottom'],
  ],
  'Host input': [
    '[data-probe="input"] input, input[data-probe="input"]',
    [
      'height',
      'paddingTop',
      'paddingLeft',
      'borderTopWidth',
      'borderTopColor',
      'backgroundColor',
      'fontSize',
    ],
  ],
  'Host button': [
    '[data-probe="button"]',
    [
      'height',
      'paddingTop',
      'paddingLeft',
      'borderTopWidth',
      'backgroundColor',
      'color',
      'fontSize',
    ],
  ],
  'Content heading (HTML)': [
    '[data-probe="help-title"]',
    ['fontSize', 'fontWeight', 'marginTop', 'marginBottom'],
  ],
  'Content paragraph (HTML)': [
    '[data-probe="help-copy"]',
    ['marginTop', 'marginBottom'],
  ],
  'Content list (HTML)': [
    '[data-probe="help-list"]',
    ['listStyleType', 'paddingLeft', 'marginTop', 'marginBottom'],
  ],
};
const verified = cssConflictExamples[example];
if (verified) {
  for (const key of Object.keys(targets)) delete targets[key];
  targets[verified.label] = [verified.selector, verified.properties];
  if (example === 'native-content')
    targets['Ordered list'] = ['ol', ['listStyleType', 'paddingLeft']];
}
function measure() {
  return Object.entries(targets).flatMap(([label, [selector, properties]]) => {
    const node = document.querySelector(selector);
    if (!node) return [];
    const style = getComputedStyle(node);
    return properties.map((property) => ({
      label,
      property,
      value: style[property],
    }));
  });
}
function measureAddedButton() {
  if (integration !== 'shadcn') return null;
  const button = document.querySelector('[data-probe="added-button"]');
  if (!button) return null;
  const style = getComputedStyle(button);
  const reference = document.createElement('span');
  reference.style.color = 'var(--primary-foreground)';
  button.append(reference);
  const expectedColor = getComputedStyle(reference).color;
  reference.remove();
  const unlayeredRules = [];
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (!rule.selectorText || !rule.style?.color) continue;
      if (button.matches(rule.selectorText)) {
        unlayeredRules.push({
          selector: rule.selectorText,
          color: rule.style.color,
        });
      }
    }
  }
  return {
    color: style.color,
    background: style.backgroundColor,
    expectedColor,
    inheritedColor: getComputedStyle(button.parentElement).color,
    unlayeredRules,
  };
}
const nextPaint = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );

function Screen() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    async function compare() {
      await document.fonts.ready;
      await nextPaint();
      await new Promise((resolve) => setTimeout(resolve, 500));
      const before = measure();
      try {
        if (integration === 'shadcn') await import('./audit-shadcn.css');
        else await import('./nexus.css');
        if (!active) return;
        setReady(true);
        await nextPaint();
        await document.fonts.ready;
        await nextPaint();
        if (!active) return;
        await new Promise((resolve) => setTimeout(resolve, 500));
        const after = measure();
        parent.postMessage(
          {
            type: 'nexus-css-comparison',
            run,
            library,
            integration,
            rows: before.map((row, index) => ({
              ...row,
              before: row.value,
              after: after[index]?.value,
            })),
            addedButton: measureAddedButton(),
            error: null,
          },
          location.origin
        );
      } catch {
        parent.postMessage(
          {
            type: 'nexus-css-comparison',
            run,
            library,
            integration,
            rows: [],
            error: 'Could not load integration styles.',
          },
          location.origin
        );
      }
    }
    compare();
    return () => {
      active = false;
    };
  }, []);
  const action =
    ready &&
    (integration === 'shadcn' ? (
      <ShadcnButton
        data-probe="added-button"
        onClick={() => setMessage('Demo only. No changes sent.')}
      >
        {actionLabel}
      </ShadcnButton>
    ) : (
      <NexusButton
        size="sm"
        onClick={() => setMessage('Demo only. No changes sent.')}
      >
        {actionLabel}
      </NexusButton>
    ));
  const content = verified ? (
    <VerifiedConflictExample example={example} />
  ) : example ? (
    <ComparisonExample
      example={example}
      library={library}
      action={action}
      message={message}
      onAction={() => setMessage('Saved in this preview only.')}
    />
  ) : (
    <div className="comparison-screen">
      {library === 'MUI' ? (
        <Typography data-probe="title" variant="h6">
          Workspace settings
        </Typography>
      ) : (
        <AntTypography.Title data-probe="title" level={4}>
          Workspace settings
        </AntTypography.Title>
      )}
      <div className="comparison-fields">
        {library === 'MUI' ? (
          <TextField
            data-probe="input"
            label="Workspace name"
            defaultValue="Design team"
            size="small"
            fullWidth
          />
        ) : (
          <div className="comparison-field">
            <label htmlFor="workspace">Workspace name</label>
            <Input
              id="workspace"
              data-probe="input"
              defaultValue="Design team"
            />
          </div>
        )}
      </div>
      <section className="comparison-help">
        <h3 data-probe="help-title">Before you invite</h3>
        <p data-probe="help-copy">Everyone you invite can:</p>
        <ul data-probe="help-list">
          <li>View shared projects</li>
          <li>Comment on your team’s work</li>
        </ul>
      </section>
      <div className="comparison-actions">
        {library === 'MUI' ? (
          <MuiButton
            data-probe="button"
            variant="contained"
            disableElevation
            onClick={() => setMessage('Workspace saved in this preview.')}
          >
            Save changes
          </MuiButton>
        ) : (
          <AntButton
            data-probe="button"
            type="primary"
            onClick={() => setMessage('Workspace saved in this preview.')}
          >
            Save changes
          </AntButton>
        )}
        {ready &&
          (integration === 'shadcn' ? (
            <ShadcnButton
              data-probe="added-button"
              onClick={() =>
                setMessage('Demo invitation opened. Nothing sent.')
              }
            >
              Invite teammate
            </ShadcnButton>
          ) : (
            <NexusButton
              size="sm"
              onClick={() =>
                setMessage('Demo invitation opened. Nothing sent.')
              }
            >
              Invite teammate
            </NexusButton>
          ))}
      </div>
      <p role="status">{message}</p>
    </div>
  );
  if (ready && integration === 'nexus')
    return (
      <NxdsAppearanceProvider
        state={appearance}
        storageKey={false}
        cookieWriteKey={false}
      >
        {content}
      </NxdsAppearanceProvider>
    );
  return content;
}
const screen = <Screen />;
createRoot(document.getElementById('root')).render(
  library === 'MUI' ? (
    <ThemeProvider
      theme={createTheme({ palette: { mode, primary: { main: '#1976d2' } } })}
    >
      <CssBaseline />
      {screen}
    </ThemeProvider>
  ) : (
    <ConfigProvider
      theme={{
        algorithm:
          mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff' },
      }}
    >
      {screen}
    </ConfigProvider>
  )
);
