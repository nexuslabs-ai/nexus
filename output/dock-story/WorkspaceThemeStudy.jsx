import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Field,
  FieldLabel,
  NativeSelect,
  NativeSelectOption,
} from '@nxds/react';

import adapterSource from './workspace-theme-adapter.css?raw';
import modelSource from './workspace-theme-model.js?raw';
import formsSource from './WorkspaceThemeForms.jsx?raw';

import './workspace-theme-study.css';

const stages = [
  { value: 'defaults', label: '1 · Nexus defaults' },
  { value: 'appearance', label: '2 · Appearance only' },
  { value: 'adapter', label: '3 · With custom code' },
];

export function WorkspaceThemeStudy({ stack, onSelectMui }) {
  const frame = useRef(null);
  const [stage, setStage] = useState('appearance');
  const [mode, setMode] = useState('light');
  const [state, setState] = useState('normal');
  useEffect(() => {
    function send() {
      frame.current?.contentWindow?.postMessage(
        {
          channel: 'nexus-workspace-theme-v1',
          type: 'configuration',
          stage,
          mode,
          state,
        },
        window.location.origin
      );
    }
    function receive(event) {
      if (
        event.source === frame.current?.contentWindow &&
        event.origin === window.location.origin &&
        event.data?.channel === 'nexus-workspace-theme-v1' &&
        event.data.type === 'ready'
      )
        send();
    }
    window.addEventListener('message', receive);
    send();
    return () => window.removeEventListener('message', receive);
  }, [stage, mode, state, stack]);

  if (stack !== 'MUI')
    return (
      <section className="workspace-theme-unmeasured">
        <h2>This study starts with MUI.</h2>
        <p>
          We haven’t tested a matching adapter for {stack}. The earlier examples
          are still in DialKit.
        </p>
        <Button onClick={onSelectMui}>Open MUI study</Button>
      </section>
    );
  return (
    <section
      className="workspace-theme-study"
      aria-label="Workspace theme matching study"
    >
      <div className="workspace-theme-intro">
        <div>
          <h2>How close can appearance settings get?</h2>
          <p>
            One workspace. A real MUI theme. Every extra styling decision made
            visible.
          </p>
        </div>
        <span className="workspace-theme-study-label">
          Theme study · MUI 9.5.0
        </span>
      </div>
      <div className="workspace-theme-toolbar">
        <div
          className="workspace-theme-stages"
          role="group"
          aria-label="Nexus matching layer"
        >
          {stages.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={stage === item.value ? 'outline' : 'ghost'}
              aria-pressed={stage === item.value}
              onClick={() => setStage(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="workspace-theme-options">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="study-mode">Mode</FieldLabel>
            <NativeSelect
              id="study-mode"
              size="sm"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <NativeSelectOption value="light">Light</NativeSelectOption>
              <NativeSelectOption value="dark">Dark</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="study-state">State</FieldLabel>
            <NativeSelect
              id="study-state"
              size="sm"
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              <NativeSelectOption value="normal">Normal</NativeSelectOption>
              <NativeSelectOption value="invalid">Invalid</NativeSelectOption>
              <NativeSelectOption value="disabled">Disabled</NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>
      </div>
      <iframe
        ref={frame}
        className="workspace-theme-preview"
        title="MUI target and Nexus workspace settings"
        src="/dock-story/workspace-theme-preview.html"
      />
      <div className="workspace-theme-findings">
        <article>
          <span>Appearance settings</span>
          <h3>A shared visual direction</h3>
          <p>
            Brand color and body font come from MUI. Neutral surfaces and subtle
            corners use Nexus presets. In this runtime, the heading font stays
            separate and Flat still leaves a Card shadow.
          </p>
        </article>
        <article>
          <span>Explicit custom code</span>
          <h3>Exact values, chosen by us</h3>
          <p>
            The third layer maps palette tokens and adds CSS for card radius,
            title type, input borders and button size, casing and shadow. This
            is a local adapter.
          </p>
        </article>
        <article>
          <span>Still different</span>
          <h3>Component anatomy stays Nexus</h3>
          <p>
            Labels stay above fields. Switch geometry, focus treatment and press
            feedback retain Nexus behavior. No claim of automatic or complete
            MUI parity.
          </p>
        </article>
      </div>
      <details className="workspace-theme-source">
        <summary>Inspect the mapping and custom code</summary>
        <p>
          The MUI target uses{' '}
          <code>createTheme({`{ palette: { mode } }`})</code>, with no theme
          overrides. Both forms share local data. The frame isolates this test
          from the page and dock.
        </p>
        <p>
          Shared test setup: the frame keeps a 16px root font size so Nexus’s
          global reset cannot resize MUI’s rem-based typography. The font
          setting uses MUI’s Roboto / Helvetica / Arial stack; no new font asset
          is loaded. Results describe the Nexus checkout used by this local
          preview.
        </p>
        <h3>Appearance mapping and scoped token overrides</h3>
        <pre>
          <code>{modelSource}</code>
        </pre>
        <h3>Consumer CSS — only enabled in layer 3</h3>
        <pre>
          <code>{adapterSource}</code>
        </pre>
        <h3>Actual MUI and Nexus compositions</h3>
        <pre>
          <code>{formsSource}</code>
        </pre>
      </details>
    </section>
  );
}
