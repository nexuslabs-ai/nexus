import { useState } from 'react';

import { Button } from '@nxds/react';

import { AntDesignLogo, MuiLogo, ShadcnLogo } from './EcosystemLogos';

import './coexistence-diagram.css';

const libraries = {
  MUI: {
    Logo: MuiLogo,
    existing: ['Subscription', 'Payment details', 'Workspace usage'],
    addition: 'Seat management',
    capabilities: ['Seat count', 'Live total', 'Plan controls'],
  },
  'Ant Design': {
    Logo: AntDesignLogo,
    existing: ['Workspace settings', 'Team members', 'Plan details'],
    addition: 'Team invitations',
    capabilities: ['Email field', 'Role selection', 'New member'],
  },
  'shadcn/ui': {
    Logo: ShadcnLogo,
    existing: ['Subscription', 'Payment history', 'Billing details'],
    addition: 'Billing activity',
    capabilities: ['Information', 'Warning', 'Success'],
  },
};

export function CoexistenceDiagram({ stack }) {
  const [alternate, setAlternate] = useState(false);
  const [replay, setReplay] = useState(0);
  const { Logo, existing, addition, capabilities } = libraries[stack];

  return (
    <figure
      className="coexistence-diagram"
      aria-label={`${stack} and Nexus coexist in one application`}
    >
      <div className="coexistence-application">
        <div className="coexistence-application-label">Your application</div>
        <div className="coexistence-peers">
          <section
            className="coexistence-peer coexistence-existing"
            aria-label="Your existing UI"
          >
            <span className="coexistence-eyebrow">Your existing UI</span>
            <div className="coexistence-library">
              <Logo size={32} aria-hidden="true" />
              <strong>{stack}</strong>
            </div>
            <div className="coexistence-nodes">
              {existing.map((label) => (
                <div className="coexistence-node" key={label}>
                  {label}
                </div>
              ))}
            </div>
            <p>Everything you’ve already built.</p>
          </section>
          <span className="coexistence-plus" aria-hidden="true">
            +
          </span>
          <section
            className="coexistence-peer coexistence-added"
            aria-label="Added with Nexus"
            key={`${stack}-${replay}`}
            data-alternate={alternate}
          >
            <span className="coexistence-eyebrow">Add where you need it</span>
            <div className="coexistence-library">
              <strong>Nexus</strong>
              <span className="coexistence-added-label">New capabilities</span>
            </div>
            <div className="coexistence-module">
              <strong>{addition}</strong>
              <div className="coexistence-capabilities">
                {capabilities.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
            <p>One addition. Your choice.</p>
          </section>
        </div>
        <div className="coexistence-appearance-paths">
          <div className="coexistence-appearance-path">
            <span className="coexistence-wire" aria-hidden="true" />
            <div>
              <span
                className="coexistence-swatch coexistence-existing-swatch"
                aria-hidden="true"
              />
              <span>Your library’s theme</span>
            </div>
            <span className="coexistence-path-note">Stays as it is</span>
          </div>
          <div
            className="coexistence-appearance-path"
            data-alternate={alternate}
          >
            <span className="coexistence-wire" aria-hidden="true" />
            <div>
              <span
                className="coexistence-swatch coexistence-nexus-swatch"
                aria-hidden="true"
              />
              <span>Nexus appearance</span>
            </div>
            <span className="coexistence-path-note">
              Changes only the addition
            </span>
          </div>
        </div>
      </div>
      <figcaption className="coexistence-diagram-caption">
        <span>Same app. Independent styles.</span>
        <div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAlternate((value) => !value)}
            aria-pressed={alternate}
          >
            Change Nexus appearance
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReplay((value) => value + 1)}
          >
            Replay
          </Button>
        </div>
      </figcaption>
    </figure>
  );
}
