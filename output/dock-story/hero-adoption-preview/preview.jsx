import { useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { Button, Card, Chip, ProgressBar } from '@heroui/react';

import './workspace.css';

import '@heroui/styles/css';

const params = new URLSearchParams(location.search);
const integration = params.get('integration') ?? 'before';
const mode = params.get('mode') === 'light' ? 'light' : 'dark';
const channel = 'nexus-hero-adoption-v1';
document.documentElement.classList.toggle('dark', mode === 'dark');
document.documentElement.style.colorScheme = mode;
document.documentElement.dataset.highlight = 'true';

const probes = [
  [
    'workspace',
    'Workspace surface',
    ['backgroundColor', 'color', 'fontFamily'],
  ],
  ['title', 'Workspace title', ['color', 'fontSize', 'fontWeight']],
  ['badge', 'Pro badge', ['backgroundColor', 'color']],
  ['usage', 'Usage card', ['backgroundColor', 'borderRadius']],
  ['description', 'Usage description', ['color', 'fontSize']],
  ['progress', 'Usage accent', ['backgroundColor']],
  ['note', 'Available seats', ['color']],
  ['invite', 'Invite button', ['backgroundColor', 'color', 'borderRadius']],
];

function measure() {
  return probes.map(([id, label, properties]) => {
    const node = document.querySelector(`[data-probe="${id}"]`);
    const style = getComputedStyle(node);
    return {
      id,
      label,
      styles: Object.fromEntries(
        properties.map((property) => [property, style[property]])
      ),
    };
  });
}

async function settle() {
  await document.fonts.ready;
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
  const finite = document
    .getAnimations()
    .filter(
      (animation) => animation.effect?.getTiming().iterations !== Infinity
    );
  await Promise.allSettled(finite.map((animation) => animation.finished));
  await new Promise(requestAnimationFrame);
}

function Workspace({ Addition, role, onRoleChange }) {
  const [invited, setInvited] = useState(false);
  return (
    <main
      className="adoption-workspace"
      data-probe="workspace"
      data-external-ui="heroui"
    >
      <header className="adoption-workspace-header">
        <span className="adoption-overline">ACME / WORKSPACE</span>
        <div className="adoption-title-row">
          <h2 data-probe="title">Design team</h2>
          <Chip color="accent" data-probe="badge">
            Pro
          </Chip>
        </div>
      </header>
      <Card data-probe="usage">
        <Card.Header>
          <Card.Title>Workspace usage</Card.Title>
          <Card.Description data-probe="description">
            This month · 8 of 10 seats
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <ProgressBar aria-label="Seats used" value={80}>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill data-probe="progress" />
            </ProgressBar.Track>
          </ProgressBar>
        </Card.Content>
        <Card.Footer>
          <Card.Description data-probe="note">
            2 seats available
          </Card.Description>
        </Card.Footer>
      </Card>
      <Button data-probe="invite" onPress={() => setInvited(true)}>
        {invited ? 'Invitation prepared' : 'Invite teammate'}
      </Button>
      <section
        className="adoption-addition"
        aria-label="New member role setting"
      >
        {Addition ? (
          <>
            <span className="adoption-addition-label">
              NEW · DEFAULT MEMBER ROLE
            </span>
            <Addition role={role} onRoleChange={onRoleChange} mode={mode} />
            <span className="adoption-addition-hint">
              New members join as {role}s.
            </span>
          </>
        ) : (
          <div className="adoption-empty-addition">
            Your existing workspace.
            <br />
            No new component yet.
          </div>
        )}
      </section>
      <span className="adoption-local-note" role="status">
        {invited
          ? 'Demo only. Nothing was sent.'
          : 'Try it. Changes stay in this preview.'}
      </span>
    </main>
  );
}

const root = createRoot(document.getElementById('root'));
let Addition;
let role = 'editor';
let report;
function render() {
  flushSync(() =>
    root.render(
      <Workspace Addition={Addition} role={role} onRoleChange={changeRole} />
    )
  );
}
function send(type, data = {}) {
  window.parent.postMessage(
    { channel, integration, mode, type, ...data },
    window.location.origin
  );
}
function changeRole(value) {
  role = value;
  render();
  send('role', { role });
}
window.addEventListener('message', (event) => {
  if (
    event.source !== window.parent ||
    event.origin !== location.origin ||
    event.data?.channel !== channel
  )
    return;
  const data = event.data;
  if (data.type !== 'configuration') return;
  document.documentElement.dataset.highlight = String(data.highlight);
  if (['viewer', 'editor', 'admin'].includes(data.role)) {
    role = data.role;
    render();
  }
  if (report) send('report', { report });
});

render();
await settle();
const before = measure();
try {
  if (integration === 'shadcn')
    ({ Addition } = await import('./ShadcnAddition'));
  if (integration === 'nexus') ({ Addition } = await import('./NexusAddition'));
  render();
  await settle();
  const after = measure();
  const changes = after.flatMap((probe, index) => {
    const properties = Object.entries(probe.styles)
      .filter(([key, value]) => before[index].styles[key] !== value)
      .map(([property, value]) => ({
        property,
        before: before[index].styles[property],
        after: value,
      }));
    return properties.length
      ? [{ id: probe.id, label: probe.label, properties }]
      : [];
  });
  for (const change of changes) {
    document.querySelector(`[data-probe="${change.id}"]`).dataset.changed =
      'true';
  }
  report = { before, after, changes, total: probes.length };
  document.documentElement.dataset.ready = 'true';
  send('report', { report });
} catch (error) {
  document.documentElement.dataset.ready = 'error';
  send('error', { message: error.message });
}
