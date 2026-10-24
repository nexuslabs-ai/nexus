import { useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { Button, Label, Switch } from '@nxds/react';
import {
  IconArrowRight,
  IconCheck,
  IconCode,
  IconPlayerPlay,
  IconWindow,
  IconX,
} from '@tabler/icons-react';
import { ButtonGroup, SelectControl } from 'dialkit';

import {
  describeStory,
  initialChecks,
  result,
  resultSummary,
  storyModes,
} from './story-test-model';
import { StoryTestDock } from './StoryTestDock';

import './story-test-iterations.css';

const tabs = storyModes.map(({ label }) => label);
const captions = {
  bento: 'One example. Its source. Observable results.',
  split: 'Read the action. See its effect. Inspect the result.',
  regression: 'The switch can look right while sending the wrong value.',
};

export function StoryTestIterations({
  iteration,
  dockIteration,
  duration,
  reduceMotion,
  theme,
}) {
  const [modeIndex, setModeIndex] = useState(
    iteration === 'regression' ? 2 : 1
  );
  const [choices, setChoices] = useState({
    states: 'off',
    interactions: 'click',
    callbacks: 'correct',
    accessibility: 'present',
  });
  const [checked, setChecked] = useState(false);
  const [calls, setCalls] = useState([]);
  const [checks, setChecks] = useState(initialChecks('interactions'));
  const [status, setStatus] = useState('Ready to run');
  const [running, setRunning] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const [inspect, setInspect] = useState(false);
  const example = useRef(null);
  const callsRef = useRef([]);
  const sequence = useRef(0);
  const programmatic = useRef(false);
  const keyboardArmed = useRef(false);
  const spacePressed = useRef(false);
  const frame = useRef(0);
  const id = useId();
  const mode = storyModes[modeIndex];
  const choice = choices[mode.id];
  const story = describeStory(mode.id, choice);
  const disabled =
    (mode.id === 'states' || mode.id === 'interactions') &&
    choice === 'disabled';
  const invalid = mode.id === 'states' && choice === 'invalid';
  const nameless = mode.id === 'accessibility' && choice === 'missing';
  const broken = (mode.id === 'callbacks' && choice !== 'correct') || nameless;
  const keyboard = mode.id === 'interactions' && choice === 'keyboard';

  useEffect(
    () => () => {
      sequence.current += 1;
      cancelAnimationFrame(frame.current);
    },
    []
  );

  function reset(nextMode = mode.id, nextChoice = choice) {
    sequence.current += 1;
    cancelAnimationFrame(frame.current);
    keyboardArmed.current = false;
    spacePressed.current = false;
    callsRef.current = [];
    setCalls([]);
    setChecked(nextMode === 'states' && nextChoice === 'on');
    setChecks(initialChecks(nextMode));
    setRunning(false);
    setActiveLine(-1);
    setStatus(
      nextMode === 'states' ? 'Example · checks not run' : 'Ready to run'
    );
  }

  function selectMode(index) {
    if (index === modeIndex) return;
    const nextMode = storyModes[index].id;
    reset(nextMode, choices[nextMode]);
    setModeIndex(index);
  }

  function selectChoice(value) {
    reset(mode.id, value);
    setChoices((current) => ({ ...current, [mode.id]: value }));
  }

  function onCheckedChange(value) {
    setChecked(value);
    const implementation = mode.id === 'callbacks' ? choice : 'correct';
    if (implementation !== 'missing') {
      callsRef.current = [
        ...callsRef.current,
        implementation === 'wrong' ? !value : value,
      ];
      setCalls(callsRef.current);
    }
    if (programmatic.current || keyboardArmed.current) return;
    sequence.current += 1;
    setRunning(false);
    setActiveLine(-1);
    setChecks(initialChecks(mode.id));
    setStatus('Example changed · run again');
  }

  function clickExample() {
    programmatic.current = true;
    flushSync(() => example.current.click());
    programmatic.current = false;
  }

  function isChecked() {
    return example.current.getAttribute('aria-checked') === 'true';
  }

  function onKeyDown(event) {
    spacePressed.current = event.key === ' ';
  }

  function onKeyUp(event) {
    if (!keyboardArmed.current || !spacePressed.current || event.key !== ' ')
      return;
    const run = sequence.current;
    frame.current = requestAnimationFrame(() => {
      if (run !== sequence.current || !example.current) return;
      const next = [
        result(
          document.activeElement === example.current,
          'Expected focus on the switch'
        ),
        result(
          isChecked(),
          `Expected: on · received: ${isChecked() ? 'on' : 'off'}`
        ),
        result(
          callsRef.current.length === 1 && callsRef.current[0] === true,
          `Expected: true once · received: ${JSON.stringify(callsRef.current)}`
        ),
      ];
      keyboardArmed.current = false;
      spacePressed.current = false;
      setChecks(next);
      setStatus(resultSummary(next));
      setActiveLine(-1);
    });
  }

  function cancelKeyboard() {
    spacePressed.current = false;
    if (!keyboardArmed.current) return;
    keyboardArmed.current = false;
    sequence.current += 1;
    setChecks(initialChecks('interactions'));
    setActiveLine(-1);
    setStatus('Keyboard check paused · focus the example again');
  }

  async function runExample(nextMode = mode.id, nextChoice = choice) {
    flushSync(() => reset(nextMode, nextChoice));
    const run = sequence.current;
    const descriptor = describeStory(nextMode, nextChoice);
    const next = initialChecks(nextMode);
    if (nextMode === 'interactions' && nextChoice === 'keyboard') {
      example.current.focus({ preventScroll: true });
      keyboardArmed.current = true;
      next[0] = result(
        document.activeElement === example.current,
        'Switch focused · press Space'
      );
      setChecks(next);
      setActiveLine(descriptor.lines[0]);
      setStatus('Press Space to test the switch');
      return;
    }
    setRunning(true);
    setStatus('Running local checks…');
    const steps = [];
    if (nextMode === 'callbacks') {
      steps.push(
        () => {
          clickExample();
          return result(
            isChecked(),
            `Expected: on · received: ${isChecked() ? 'on' : 'off'}`
          );
        },
        () =>
          result(
            callsRef.current.length === 1,
            `Expected: 1 call · received: ${callsRef.current.length}`
          ),
        () =>
          result(
            callsRef.current.at(-1) === true,
            `Expected: true · received: ${callsRef.current.length ? String(callsRef.current.at(-1)) : 'nothing'}`
          )
      );
    } else if (nextMode === 'accessibility') {
      steps.push(() => {
        const name = Array.from(example.current.labels || [])
          .map((label) => label.textContent.trim())
          .join(' ');
        return result(
          name === 'Email notifications',
          name || 'No associated accessible name'
        );
      });
    } else if (nextMode === 'states') {
      steps.push(
        () =>
          result(
            isChecked() === (nextChoice === 'on'),
            `Expected: ${nextChoice === 'on' ? 'on' : 'off'} · received: ${isChecked() ? 'on' : 'off'}`
          ),
        () => {
          const was = isChecked();
          clickExample();
          const changed = isChecked() !== was;
          const ok = nextChoice === 'disabled' ? !changed : changed;
          flushSync(() => setChecked(was));
          return result(ok, changed ? 'Click accepted' : 'Click ignored');
        },
        () =>
          result(
            (example.current.getAttribute('aria-invalid') === 'true') ===
              (nextChoice === 'invalid'),
            nextChoice === 'invalid'
              ? 'Invalid state · error linked below'
              : 'No error state'
          )
      );
    } else if (nextChoice === 'disabled') {
      steps.push(
        () => result(example.current.disabled, 'Expected disabled control'),
        () => {
          clickExample();
          return result(
            !isChecked(),
            `After click: ${isChecked() ? 'on' : 'off'}`
          );
        },
        () =>
          result(
            callsRef.current.length === 0,
            `Expected: 0 calls · received: ${callsRef.current.length}`
          )
      );
    } else {
      steps.push(
        () => result(!isChecked(), 'Expected initial state: off'),
        () => {
          clickExample();
          return result(
            isChecked(),
            `After first click: ${isChecked() ? 'on' : 'off'}`
          );
        },
        () => {
          clickExample();
          return result(
            !isChecked(),
            `After second click: ${isChecked() ? 'on' : 'off'}`
          );
        }
      );
    }
    for (let index = 0; index < steps.length; index += 1) {
      if (run !== sequence.current) return;
      next[index] = { status: 'running', detail: 'Checking…' };
      setChecks([...next]);
      setActiveLine(descriptor.lines[index]);
      await new Promise((resolve) =>
        setTimeout(resolve, reduceMotion ? 0 : 420)
      );
      if (run !== sequence.current) return;
      next[index] = steps[index]();
      setChecks([...next]);
    }
    if (run !== sequence.current) return;
    setRunning(false);
    setActiveLine(-1);
    setStatus(resultSummary(next));
  }

  function toggleRegression() {
    const nextChoice =
      mode.id === 'callbacks' && choice !== 'correct' ? 'correct' : 'wrong';
    flushSync(() => {
      setModeIndex(2);
      setChoices((current) => ({ ...current, callbacks: nextChoice }));
    });
    runExample('callbacks', nextChoice);
  }

  const runLabel = keyboard
    ? 'Try the keyboard'
    : mode.id === 'states'
      ? 'Check the state'
      : 'Run example';
  const outcome = checks.some((check) => check.status === 'fail')
    ? 'fail'
    : checks.some((check) => check.status === 'pass')
      ? 'pass'
      : '';
  return (
    <>
      <div className="dock-chapter-heading story-tests-heading">
        <h1>Stories are the tests.</h1>
        <p>The example you explore is the example we check.</p>
        <div className="story-test-actions">
          <Button onClick={() => runExample()} disabled={running}>
            <IconPlayerPlay
              data-prototype-icon="true"
              size={16}
              aria-hidden="true"
            />
            {running ? 'Running…' : runLabel}
          </Button>
          <Button variant="outline" onClick={toggleRegression}>
            {mode.id === 'callbacks' && choice !== 'correct'
              ? 'Restore correct behavior'
              : 'Try a regression'}
          </Button>
          {iteration === 'regression' && (
            <Button
              variant="ghost"
              aria-pressed={inspect}
              onClick={() => setInspect(!inspect)}
            >
              {inspect ? 'Focus on results' : 'Inspect story'}
            </Button>
          )}
        </div>
      </div>
      <div
        className="story-canvas story-tests-canvas"
        id="story-panel"
        role={dockIteration === 'colored' ? 'tabpanel' : 'region'}
        aria-labelledby={`story-tab-tests-${modeIndex}`}
      >
        <div
          className="story-tests-workspace"
          data-layout={iteration}
          data-inspect={inspect}
        >
          <section
            className="story-test-card story-test-preview"
            aria-label="Live switch example"
          >
            <header>
              <span>
                <IconWindow
                  data-prototype-icon="true"
                  size={16}
                  aria-hidden="true"
                />
                Live example
              </span>
              <span className="story-test-bug">
                {broken ? 'Example regression' : 'Nexus Switch'}
              </span>
            </header>
            <div className="story-test-live">
              <div className="story-test-preference">
                <h2>Stay in the loop.</h2>
                <p>A small preference. A behavior worth checking.</p>
                <div className="story-test-setting">
                  <div>
                    <Label htmlFor={nameless ? undefined : id}>
                      Email notifications
                    </Label>
                    <p id={`${id}-description`}>
                      Product updates, on your terms.
                    </p>
                  </div>
                  <Switch
                    ref={example}
                    id={id}
                    checked={checked}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-describedby={
                      invalid ? `${id}-error` : `${id}-description`
                    }
                    onCheckedChange={onCheckedChange}
                    onKeyDown={onKeyDown}
                    onKeyUp={onKeyUp}
                    onPointerDown={cancelKeyboard}
                    onBlur={cancelKeyboard}
                  />
                </div>
                {invalid && (
                  <p className="story-test-error" id={`${id}-error`}>
                    Choose a notification preference.
                  </p>
                )}
                {nameless && (
                  <p className="story-test-error">
                    The visible label is deliberately disconnected in this
                    example.
                  </p>
                )}
              </div>
            </div>
            <footer>
              <span>
                State{' '}
                <code>
                  {checked ? 'on' : 'off'}
                  {disabled ? ' · disabled' : ''}
                </code>
              </span>
              <span>
                Callback{' '}
                <code>{calls.length ? String(calls.at(-1)) : '—'}</code>
              </span>
            </footer>
          </section>
          {(iteration !== 'regression' || inspect) && (
            <section
              className="story-test-card story-test-source"
              aria-label="Storybook source excerpt"
            >
              <header>
                <span>
                  <IconCode
                    data-prototype-icon="true"
                    size={16}
                    aria-hidden="true"
                  />
                  Switch.stories.tsx
                </span>
                <span>{story.name}</span>
              </header>
              <pre>
                <code>
                  {story.source.map((line, index) => (
                    <span
                      className="story-test-code-line"
                      key={index}
                      data-current={activeLine === index}
                      data-result={checks[story.lines.indexOf(index)]?.status}
                    >
                      <span
                        className="story-test-line-number"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <span>{line || ' '}</span>
                    </span>
                  ))}
                </code>
              </pre>
              <p className="story-test-source-note">
                Storybook excerpt · equivalent checks run locally on this
                example.
              </p>
            </section>
          )}
          <section
            className="story-test-card story-test-results"
            aria-label="Observed check results"
          >
            <header>
              <span>{mode.id === 'states' ? 'State checks' : 'Checks'}</span>
              <span
                role="status"
                className="story-test-status"
                data-outcome={outcome}
              >
                {status}
              </span>
            </header>
            <ul>
              {checks.map((check, index) => (
                <li key={story.labels[index]} data-result={check.status}>
                  <span className="story-test-check-icon" aria-hidden="true">
                    {check.status === 'pass' ? (
                      <IconCheck data-prototype-icon="true" size={18} />
                    ) : check.status === 'fail' ? (
                      <IconX data-prototype-icon="true" size={18} />
                    ) : check.status === 'running' ? (
                      <IconArrowRight data-prototype-icon="true" size={18} />
                    ) : (
                      '○'
                    )}
                  </span>
                  <div>
                    <strong>{story.labels[index]}</strong>
                    <small>{check.detail}</small>
                    <span className="story-test-result-label">
                      {check.status === 'pass'
                        ? 'Passed'
                        : check.status === 'fail'
                          ? 'Failed'
                          : check.status === 'manual'
                            ? 'Manual review'
                            : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <p className="story-test-caption">
          {captions[iteration]}
          <span>
            {mode.id === 'accessibility'
              ? 'Accessible-name check only. Automated checks are one part of accessibility testing.'
              : 'Interactive prototype · local checks, not the Nexus CI suite.'}
          </span>
        </p>
      </div>
      <div className="story-dock-position story-test-dock-position">
        <StoryTestDock
          iteration={dockIteration}
          chapter="tests"
          title="Explore the stories"
          tabs={tabs}
          selected={modeIndex}
          onSelect={selectMode}
          duration={duration}
          reduceMotion={reduceMotion}
          theme={theme}
        >
          <div
            className="story-test-tool-controls dialkit-root"
            data-theme={theme}
          >
            <p className="story-test-tool-description">{mode.description}</p>
            <SelectControl
              label={mode.field}
              value={choice}
              options={mode.options}
              onChange={selectChoice}
            />
            <ButtonGroup
              buttons={[
                {
                  label: keyboard
                    ? 'Focus the switch'
                    : running
                      ? 'Restart checks'
                      : 'Run selected check',
                  onClick: () => runExample(),
                },
              ]}
            />
            <p className="story-test-tool-description">
              {mode.id === 'accessibility'
                ? 'Name check only · not an axe audit.'
                : 'Runs on the live example above.'}
            </p>
          </div>
        </StoryTestDock>
      </div>
    </>
  );
}
