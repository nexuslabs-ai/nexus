import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Field,
  FieldLabel,
  NativeSelect,
  NativeSelectOption,
  Switch,
} from '@nxds/react';

import './hero-adoption-study.css';

const channel = 'nexus-hero-adoption-v1';
const cases = [
  {
    id: 'before',
    number: '01',
    title: 'Your HeroUI app',
    subtitle: 'The starting point',
  },
  {
    id: 'shadcn',
    number: '02',
    title: 'Add a shadcn Select',
    subtitle: 'With its default global styles',
  },
  {
    id: 'nexus',
    number: '03',
    title: 'Add a Nexus Select',
    subtitle: 'With its prefixed styles',
  },
];

function ComparisonFrame({
  id,
  title,
  mode,
  highlight,
  role,
  onRoleChange,
  onReport,
}) {
  const frame = useRef(null);
  const configure = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      { channel, type: 'configuration', highlight, role },
      location.origin
    );
  }, [highlight, role]);
  useEffect(() => {
    function receive(event) {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== channel
      )
        return;
      if (event.data.mode !== mode || event.data.integration !== id) return;
      if (event.data.type === 'report') onReport(id, event.data.report);
      if (event.data.type === 'error')
        onReport(id, { error: event.data.message });
      if (event.data.type === 'role') onRoleChange(event.data.role);
    }
    window.addEventListener('message', receive);
    configure();
    return () => window.removeEventListener('message', receive);
  }, [id, mode, configure, onReport, onRoleChange]);
  return (
    <iframe
      ref={frame}
      onLoad={configure}
      className="hero-adoption-frame"
      title={title}
      src={`/hero-adoption-preview/index.html?integration=${id}&mode=${mode}`}
    />
  );
}

function Study({ mode, setMode }) {
  const [highlight, setHighlight] = useState(true);
  const [role, setRole] = useState('editor');
  const [reports, setReports] = useState({});
  const receiveReport = useCallback((id, report) => {
    setReports((current) => ({ ...current, [id]: report }));
  }, []);
  const baselineMatches =
    cases.every(({ id }) => reports[id]?.before) &&
    cases.every(
      ({ id }) =>
        JSON.stringify(reports[id].before) ===
        JSON.stringify(reports.before.before)
    );
  return (
    <section
      className="hero-adoption-study"
      aria-label="HeroUI incremental adoption comparison"
    >
      <div className="hero-adoption-intro">
        <div>
          <h2>Add one component. Keep everything else.</h2>
          <p>
            The same HeroUI workspace. The same new role selector. Two ways to
            bring it in.
          </p>
        </div>
        <div className="hero-adoption-options">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="hero-adoption-mode">Mode</FieldLabel>
            <NativeSelect
              id="hero-adoption-mode"
              size="sm"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <NativeSelectOption value="dark">Dark</NativeSelectOption>
              <NativeSelectOption value="light">Light</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field orientation="horizontal">
            <Switch
              id="hero-adoption-highlight"
              checked={highlight}
              onCheckedChange={setHighlight}
            />
            <FieldLabel htmlFor="hero-adoption-highlight">
              Highlight changes
            </FieldLabel>
          </Field>
        </div>
      </div>
      <div className="hero-adoption-cases">
        {cases.map(({ id, number, title, subtitle }) => {
          const report = reports[id];
          const changed = report?.changes?.length ?? 0;
          return (
            <article
              className="hero-adoption-case"
              key={id}
              data-result={
                report?.changes ? (changed ? 'changed' : 'intact') : 'pending'
              }
            >
              <header>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{subtitle}</p>
                </div>
              </header>
              <div className="hero-adoption-frame-shell">
                <ComparisonFrame
                  id={id}
                  title={title}
                  mode={mode}
                  highlight={highlight}
                  role={role}
                  onRoleChange={setRole}
                  onReport={receiveReport}
                />
              </div>
              <div className="hero-adoption-result" role="status">
                <span className="hero-adoption-result-dot" aria-hidden="true" />
                {!report
                  ? 'Measuring host styles…'
                  : report.error
                    ? 'Preview failed to load'
                    : id === 'before'
                      ? 'Original workspace'
                      : changed
                        ? `${changed} of ${report.total} host elements changed`
                        : `${report.total} of ${report.total} host elements unchanged`}
              </div>
              <p className="hero-adoption-outcome">
                {id === 'before'
                  ? 'Blue accent. Readable secondary text. Your existing components.'
                  : id === 'shadcn'
                    ? 'Shared token names can change the accent, text and surface of the existing app.'
                    : 'The new Select brings its own tokens. The host keeps its original appearance.'}
              </p>
            </article>
          );
        })}
      </div>
      <div className="hero-adoption-footnote">
        <p>
          Both added Selects work. Choose a role in either one to update both.
        </p>
        <p>
          This tests default stylesheet imports after HeroUI. A scoped or
          customized shadcn setup can avoid these collisions.
        </p>
      </div>
      <details className="hero-adoption-evidence">
        <summary>Inspect what changed and why</summary>
        <p>
          {baselineMatches
            ? 'All three frames started with identical sampled host styles.'
            : 'Waiting for matching baseline measurements.'}{' '}
          Each frame contains HeroUI and the added library in the same document.
          Frames separate the experiments from each other and from the dock;
          they do not isolate the added component from HeroUI.
        </p>
        <p>
          HeroUI uses <code>--accent</code> for its accent color and{' '}
          <code>--muted</code> for secondary text. The imported shadcn
          stylesheet defines those same names. Nexus uses <code>--nx-*</code>{' '}
          tokens and <code>nx:</code> utilities. Its Select is mounted inside
          the Nexus Appearance Provider, with the same explicit mode and
          persistence disabled.
        </p>
        <p>
          Red outlines come from computed-style changes, not simulated breakage.
          We sample color, background, type and corners on eight host elements.
          This is a bounded demonstration, not a claim that all integrations
          break or that Nexus is immune to arbitrary global CSS.
        </p>
        <div className="hero-adoption-measurements">
          {cases
            .filter(({ id }) => id !== 'before')
            .map(({ id, title }) => (
              <section key={id}>
                <h3>{title}</h3>
                {!reports[id]?.changes ? (
                  <p>Measurements pending.</p>
                ) : reports[id].changes.length === 0 ? (
                  <p>No differences in the sampled host styles.</p>
                ) : (
                  reports[id].changes.map((change) => (
                    <div className="hero-adoption-measurement" key={change.id}>
                      <strong>{change.label}</strong>
                      {change.properties.map((property) => (
                        <p key={property.property}>
                          <code>{property.property}</code>:{' '}
                          <code>{property.before}</code> →{' '}
                          <code>{property.after}</code>
                        </p>
                      ))}
                    </div>
                  ))
                )}
              </section>
            ))}
        </div>
        <p>
          Uses installed HeroUI 3.2.6, the checked-in shadcn Select and default
          stylesheet, and Nexus source from this checkout.{' '}
          <a
            href="https://heroui.com/en/docs/react/components/progress-bar"
            target="_blank"
            rel="noreferrer"
          >
            HeroUI source anatomy
          </a>{' '}
          ·{' '}
          <a
            href="https://ui.shadcn.com/docs/theming"
            target="_blank"
            rel="noreferrer"
          >
            shadcn default theme
          </a>
        </p>
      </details>
    </section>
  );
}

export function HeroAdoptionStudy() {
  const [mode, setMode] = useState('dark');
  return <Study key={mode} mode={mode} setMode={setMode} />;
}
