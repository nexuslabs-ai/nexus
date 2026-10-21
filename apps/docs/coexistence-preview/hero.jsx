import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Avatar, Button, Card, Chip, ProgressBar } from '@heroui/react';

import './hero-workspace.css';

import '@heroui/styles/css';

const params = new URLSearchParams(location.search);
const integration = params.get('integration');
const mode = params.get('mode') === 'dark' ? 'dark' : 'light';
document.documentElement.classList.toggle('dark', mode === 'dark');
document.documentElement.style.colorScheme = mode;
if (integration === 'shadcn') {
  await import('./audit-shadcn.css');
} else if (integration === 'nexus') {
  await import('./nexus.css');
}

function Workspace() {
  const [status, setStatus] = useState('Invitations stay in this preview.');
  return (
    <main className="hero-workspace">
      <header>
        <span className="hero-overline">ACME / WORKSPACE SETTINGS</span>
        <div className="hero-title">
          <h2>Design team</h2>
          <Chip color="accent">Pro workspace</Chip>
        </div>
        <Card.Description>
          Everything your team needs to build together.
        </Card.Description>
      </header>
      <Card>
        <Card.Header>
          <Card.Title>Workspace usage</Card.Title>
          <Card.Description>This month · 8 of 10 seats</Card.Description>
        </Card.Header>
        <Card.Content>
          <ProgressBar aria-label="Seats used" value={80}>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </Card.Content>
        <Card.Footer>
          <Card.Description>
            2 seats available. Invite your next collaborator.
          </Card.Description>
        </Card.Footer>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title>Team members</Card.Title>
          <Card.Description>8 members</Card.Description>
        </Card.Header>
        <Card.Content className="hero-members">
          <div className="hero-person">
            <Avatar aria-label="Alex Lee">
              <Avatar.Fallback>AL</Avatar.Fallback>
            </Avatar>
            <div>
              <strong>Alex Lee</strong>
              <Card.Description>alex@acme.design</Card.Description>
            </div>
            <Chip>Owner</Chip>
          </div>
          <div className="hero-person">
            <Avatar aria-label="Sam Patel">
              <Avatar.Fallback>SP</Avatar.Fallback>
            </Avatar>
            <div>
              <strong>Sam Patel</strong>
              <Card.Description>sam@acme.design</Card.Description>
            </div>
            <Chip>Editor</Chip>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <div className="hero-between">
            <Card.Title>Pro plan</Card.Title>
            <strong>$240 /mo</strong>
          </div>
          <Card.Description>
            Renews November 1 · billed monthly
          </Card.Description>
        </Card.Header>
      </Card>
      <div className="hero-actions">
        <Button
          onPress={() =>
            setStatus('Demo invitation prepared. Nothing was sent.')
          }
        >
          Invite teammate
        </Button>
        <Button
          variant="secondary"
          onPress={() =>
            setStatus(
              'Workspace settings opened in this demo. Nothing changed.'
            )
          }
        >
          Manage workspace
        </Button>
      </div>
      <p role="status">{status}</p>
    </main>
  );
}
createRoot(document.getElementById('root')).render(<Workspace />);
