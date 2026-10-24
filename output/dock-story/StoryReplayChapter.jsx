import { useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { Button, Label, Switch } from '@nxds/react';
import {
  IconArrowRight,
  IconBell,
  IconCheck,
  IconCode,
  IconPlayerPlay,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { ButtonGroup } from 'dialkit';

import { StoryTestDock } from './StoryTestDock';

import './story-replay.css';

const tabs = ['Click', 'Keyboard', 'Disabled'];
const storyLink =
  'https://github.com/nexuslabs-ai/nxds/blob/main/packages/react/src/components/switch/Switch.stories.tsx';

function stepsFor(scenario) {
  return [
    'Starts off',
    scenario === 'Keyboard' ? 'Press Space' : 'Click the switch',
    scenario === 'Disabled' ? 'Stays off' : 'Turns on',
    scenario === 'Disabled' ? 'No change sent' : 'App receives on',
  ];
}

function storyCode(scenario) {
  const disabled = scenario === 'Disabled';
  return [
    "const toggle = canvas.getByRole('switch');",
    "await expect(toggle).toHaveAttribute('aria-checked', 'false');",
    ...(disabled ? ['await expect(toggle).toBeDisabled();'] : []),
    ...(scenario === 'Keyboard'
      ? ['toggle.focus();', "await userEvent.keyboard(' ');"]
      : ['await userEvent.click(toggle);']),
    `await expect(toggle).toHaveAttribute('aria-checked', '${!disabled}');`,
    disabled
      ? 'await expect(args.onCheckedChange).not.toHaveBeenCalled();'
      : 'await expect(args.onCheckedChange).toHaveBeenCalledWith(true);',
  ].join('\n');
}

export function StoryReplayChapter({
  dockIteration,
  duration,
  reduceMotion,
  theme,
}) {
  const [selected, setSelected] = useState(0);
  const [broken, setBroken] = useState(false);
  const [checked, setChecked] = useState(false);
  const [calls, setCalls] = useState([]);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(-1);
  const [inspection, setInspection] = useState(null);
  const example = useRef(null);
  const observedCalls = useRef([]);
  const runId = useRef(0);
  const acting = useRef(false);
  const running = useRef(false);
  const awaitingSpace = useRef(false);
  const spaceDown = useRef(false);
  const id = useId();
  const scenario = tabs[selected];
  const disabled = scenario === 'Disabled';
  const busy = status === 'running' || status === 'waiting';
  const labels = stepsFor(scenario);
  const snapshot = inspection === null ? null : records[inspection];
  const displayedChecked = snapshot ? snapshot.checked : checked;
  const displayedCalls = snapshot ? snapshot.calls : calls;
  const received = displayedCalls.length ? displayedCalls.at(-1) : null;
  const mismatch = received !== null && received !== displayedChecked;
  const callbackMismatch = records[2]?.pass && records[3]?.pass === false;
  const failedCheck = records.find((entry) => entry && !entry.pass);

  useEffect(
    () => () => {
      runId.current += 1;
    },
    []
  );

  function reset() {
    runId.current += 1;
    observedCalls.current = [];
    running.current = false;
    awaitingSpace.current = false;
    spaceDown.current = false;
    setChecked(false);
    setCalls([]);
    setRecords([]);
    setCurrentStep(-1);
    setInspection(null);
    setStatus('idle');
  }

  function selectScenario(index) {
    if (index === selected) return;
    reset();
    setSelected(index);
    if (tabs[index] === 'Disabled') setBroken(false);
  }

  function onCheckedChange(value) {
    if (inspection !== null || (running.current && !acting.current)) return;
    setChecked(value);
    observedCalls.current = [...observedCalls.current, broken ? !value : value];
    setCalls([...observedCalls.current]);
    if (acting.current || awaitingSpace.current) return;
    setRecords([]);
    setCurrentStep(-1);
    setStatus('changed');
  }

  function record(index, pass, detail) {
    const entry = {
      pass,
      detail,
      checked: example.current.getAttribute('aria-checked') === 'true',
      calls: [...observedCalls.current],
    };
    setRecords((previous) => {
      const next = [...previous];
      next[index] = entry;
      return next;
    });
    return pass;
  }

  async function pause(run) {
    await new Promise((resolve) => setTimeout(resolve, reduceMotion ? 0 : 480));
    return run === runId.current && Boolean(example.current);
  }

  async function finishChecks(run) {
    if (!(await pause(run))) return;
    setCurrentStep(2);
    const actual = example.current.getAttribute('aria-checked') === 'true';
    const statePassed = record(
      2,
      actual === !disabled,
      `Expected ${disabled ? 'off' : 'on'} · received ${actual ? 'on' : 'off'}`
    );
    if (!(await pause(run))) return;
    setCurrentStep(3);
    const sent = observedCalls.current;
    const callbackPassed = record(
      3,
      disabled ? sent.length === 0 : sent.length === 1 && sent[0] === true,
      disabled
        ? `Expected no calls · received ${sent.length}`
        : `Expected true · received ${sent.length ? JSON.stringify(sent).slice(1, -1) : 'nothing'}`
    );
    running.current = false;
    setStatus(statePassed && callbackPassed ? 'pass' : 'fail');
  }

  async function runStory() {
    flushSync(reset);
    const run = runId.current;
    running.current = true;
    setStatus('running');
    setCurrentStep(0);
    const startPassed = record(
      0,
      example.current.getAttribute('aria-checked') === 'false' &&
        observedCalls.current.length === 0 &&
        (!disabled || example.current.disabled),
      disabled ? 'Off and disabled · no changes sent' : 'Off · no changes sent'
    );
    if (!startPassed) {
      running.current = false;
      setStatus('fail');
      return;
    }
    if (!(await pause(run))) return;
    setCurrentStep(1);
    if (scenario === 'Keyboard') {
      running.current = false;
      awaitingSpace.current = true;
      example.current.focus({ preventScroll: true });
      setStatus('waiting');
      return;
    }
    acting.current = true;
    flushSync(() => example.current.click());
    acting.current = false;
    record(1, true, 'Click dispatched to the live switch');
    await finishChecks(run);
  }

  function onKeyDown(event) {
    if (awaitingSpace.current && event.key === ' ') spaceDown.current = true;
  }

  function onKeyUp(event) {
    if (!awaitingSpace.current || !spaceDown.current || event.key !== ' ')
      return;
    const run = runId.current;
    setStatus('running');
    requestAnimationFrame(() => {
      if (run !== runId.current || !example.current) return;
      awaitingSpace.current = false;
      spaceDown.current = false;
      running.current = true;
      record(1, true, 'Space pressed on the focused switch');
      void finishChecks(run);
    });
  }

  function cancelKeyboard() {
    if (!awaitingSpace.current) return;
    reset();
    setStatus('changed');
  }

  function introduceBug() {
    reset();
    setBroken(true);
    if (disabled) setSelected(0);
  }

  function fixAndRerun() {
    flushSync(() => setBroken(false));
    void runStory();
  }

  function inspectStep(index) {
    if (busy || !records[index]) return;
    setInspection(index);
  }

  const statusText = {
    idle: 'Ready to run',
    changed: 'Example changed · run to check',
    running: 'Running the story…',
    waiting: 'Press Space on the switch',
    pass: 'All checks passed',
    fail: 'A check failed',
  }[status];

  return (
    <>
      <div className="dock-chapter-heading story-replay-heading">
        <h1>Stories are the tests.</h1>
        <p>Try the example. Follow the checks. Catch what you can’t see.</p>
        <div className="story-ctas">
          <Button onClick={runStory} disabled={busy}>
            <IconPlayerPlay data-prototype-icon="true" aria-hidden="true" />
            {busy ? 'Running…' : records.length ? 'Run again' : 'Run the story'}
          </Button>
          <Button
            variant="outline"
            onClick={broken ? fixAndRerun : introduceBug}
            disabled={busy}
          >
            {broken ? 'Fix and rerun' : 'Introduce a bug'}
          </Button>
        </div>
      </div>

      <div
        className="story-canvas story-replay-canvas"
        id="story-panel"
        role="region"
        aria-label={`${scenario} story walkthrough`}
      >
        <div className="story-replay-workspace">
          <section className="story-replay-specimen">
            <header className="story-replay-bar">
              <span>
                <span className="story-replay-dot" />
                {snapshot
                  ? `Recorded step ${inspection + 1}`
                  : 'Live component'}
              </span>
              <span>{broken ? 'Intentional bug' : 'Nexus Switch'}</span>
            </header>
            <div className="story-replay-product">
              <IconBell
                className="story-replay-bell"
                size={32}
                stroke={1.35}
                data-prototype-icon="true"
                aria-hidden="true"
              />
              <h2>A little less noise.</h2>
              <p>Choose what makes it to your inbox.</p>
              <div className="story-replay-preference">
                <div>
                  <Label htmlFor={id}>Email notifications</Label>
                  <p id={`${id}-description`}>
                    {disabled
                      ? 'Managed by your workspace.'
                      : 'The updates you want. When you want them.'}
                  </p>
                </div>
                <Switch
                  ref={example}
                  id={id}
                  checked={displayedChecked}
                  disabled={disabled}
                  aria-readonly={snapshot ? true : undefined}
                  aria-describedby={`${id}-description`}
                  onCheckedChange={onCheckedChange}
                  onKeyDown={onKeyDown}
                  onKeyUp={onKeyUp}
                  onPointerDown={cancelKeyboard}
                  onBlur={cancelKeyboard}
                />
              </div>
              <p className="story-replay-hint">
                {status === 'waiting'
                  ? 'The switch is focused. Press Space to continue.'
                  : snapshot
                    ? 'A recorded moment. Return to live to try it yourself.'
                    : 'Go ahead, try it. Then run the story to check it.'}
              </p>
            </div>
            <div className="story-replay-observation" data-mismatch={mismatch}>
              <div>
                <span>What you see</span>
                <strong>{displayedChecked ? 'On' : 'Off'}</strong>
              </div>
              <IconArrowRight
                size={20}
                stroke={1.5}
                data-prototype-icon="true"
                aria-hidden="true"
              />
              <div>
                <span>What the app receives</span>
                <strong>
                  {received === null
                    ? 'No change yet'
                    : received
                      ? 'On'
                      : 'Off'}
                  {received !== null && <code>{String(received)}</code>}
                </strong>
              </div>
            </div>
            <footer className="story-replay-bar">
              <span>
                {snapshot
                  ? 'Inspecting a recorded result'
                  : 'A real component. Real events.'}
              </span>
              {snapshot ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInspection(null)}
                >
                  Return to live
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <IconRefresh data-prototype-icon="true" aria-hidden="true" />
                  Reset
                </Button>
              )}
            </footer>
          </section>

          <section className="story-replay-trace">
            <header className="story-replay-bar">
              <span>Switch / {scenario}</span>
              <span
                className="story-replay-status"
                role="status"
                data-result={status}
              >
                {statusText}
              </span>
            </header>
            <ol className="story-replay-steps" aria-label="Story steps">
              {labels.map((label, index) => {
                const entry = records[index];
                const active =
                  inspection === index ||
                  (inspection === null && currentStep === index);
                return (
                  <li
                    key={`${scenario}-${index}`}
                    data-result={
                      entry ? (entry.pass ? 'pass' : 'fail') : 'pending'
                    }
                    data-active={active}
                  >
                    <button
                      type="button"
                      disabled={busy || !entry}
                      aria-pressed={inspection === index}
                      onClick={() => inspectStep(index)}
                    >
                      <span
                        className="story-replay-step-number"
                        aria-hidden="true"
                      >
                        {entry ? (
                          entry.pass ? (
                            <IconCheck size={17} />
                          ) : (
                            <IconX size={17} />
                          )
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span>
                        <strong>{label}</strong>
                        <small>
                          {entry
                            ? entry.detail
                            : index === currentStep && status === 'waiting'
                              ? 'Waiting for your keyboard input'
                              : index === 1
                                ? 'User action'
                                : 'Expected behavior'}
                        </small>
                      </span>
                      <span className="story-replay-step-result">
                        {entry
                          ? entry.pass
                            ? index === 1
                              ? 'Done'
                              : 'Passed'
                            : 'Failed'
                          : '—'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="story-replay-takeaway" data-result={status}>
              <strong>
                {status === 'fail'
                  ? callbackMismatch
                    ? 'Looks right. Sends the wrong value.'
                    : 'The result didn’t match the story.'
                  : status === 'pass'
                    ? disabled
                      ? 'Disabled means no changes.'
                      : 'The UI and the app agree.'
                    : broken
                      ? 'Can you catch the hidden bug?'
                      : 'More than a good-looking example.'}
              </strong>
              <p>
                {status === 'fail'
                  ? callbackMismatch
                    ? 'The switch turned on, but the app received false. The last check caught it.'
                    : failedCheck?.detail
                  : status === 'pass'
                    ? 'The same example is now a repeatable check for your next change.'
                    : broken
                      ? 'The switch will still turn on. Run the story to see what the app receives.'
                      : 'A story checks what your component does, including the parts you can’t see.'}
              </p>
            </div>
            <details className="story-replay-code">
              <summary>
                <IconCode
                  size={16}
                  data-prototype-icon="true"
                  aria-hidden="true"
                />
                View story code
              </summary>
              <pre>
                <code>{storyCode(scenario)}</code>
              </pre>
              <p>
                Equivalent Storybook play steps. This preview runs local DOM and
                callback checks.
              </p>
            </details>
          </section>
        </div>
        <p className="story-replay-note">
          Built with the Nexus Switch. Local interactive checks, not a CI run.{' '}
          <a href={storyLink} target="_blank" rel="noreferrer">
            View the component story ↗
          </a>
        </p>
      </div>

      <div className="story-dock-position">
        <StoryTestDock
          iteration={dockIteration}
          chapter="tests"
          title="Choose a story"
          tabs={tabs}
          selected={selected}
          onSelect={selectScenario}
          duration={duration}
          reduceMotion={reduceMotion}
          theme={theme}
        >
          <div className="story-replay-controls">
            <p>
              {scenario === 'Keyboard'
                ? 'Use your keyboard to test the real switch. Start the story, then press Space.'
                : disabled
                  ? 'A disabled control should stay off and send no changes.'
                  : 'Follow one click from the visible state to the value received by the app.'}
            </p>
            <ButtonGroup
              buttons={[
                {
                  label: busy ? 'Restart story' : 'Run the story',
                  onClick: runStory,
                },
                { label: 'Reset example', onClick: reset },
              ]}
            />
          </div>
        </StoryTestDock>
      </div>
    </>
  );
}
