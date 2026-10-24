import { useRef, useState } from 'react';

import { Button } from '@nxds/react';
import { IconCode } from '@tabler/icons-react';

const scenarios = {
  Click: {
    label: 'Save changes',
    title: 'An action you can count on.',
    instruction: 'Click the button. Each activation is recorded.',
    code: 'await userEvent.click(button);\nawait expect(args.onClick)\n  .toHaveBeenCalledTimes(1);',
  },
  Keyboard: {
    label: 'Save changes',
    title: 'The keyboard gets the same care.',
    instruction: 'Focus the example, then press Enter or Space.',
    code: "await userEvent.tab();\nawait expect(button).toHaveFocus();\nawait userEvent.keyboard('{Enter}');\nawait expect(args.onClick)\n  .toHaveBeenCalledTimes(1);",
  },
  Disabled: {
    label: 'Save changes',
    title: 'Disabled means no action.',
    instruction: 'The disabled button does not activate.',
    code: 'await expect(button).toBeDisabled();\nawait userEvent.click(button);\nawait expect(args.onClick)\n  .not.toHaveBeenCalled();',
  },
};

export function StoriesChapter({ scenario }) {
  const example = useRef(null);
  const [activations, setActivations] = useState(0);
  const current = scenarios[scenario];

  return (
    <div className="stories-chapter story-chapter-content">
      <section
        className="story-specimen"
        aria-label={`${scenario} button story`}
      >
        <header className="story-specimen-header">
          <span>
            <IconCode size={18} aria-hidden="true" /> Button.stories.tsx
          </span>
          <span>{scenario}</span>
        </header>
        <div className="story-specimen-body">
          <div className="story-example">
            <h2>{current.title}</h2>
            <div className="story-example-button">
              <Button
                ref={example}
                variant="outline"
                disabled={scenario === 'Disabled'}
                onClick={() => setActivations((count) => count + 1)}
              >
                {current.label}
              </Button>
            </div>
            <p>{current.instruction}</p>
            <div className="story-example-actions">
              {scenario === 'Keyboard' && (
                <button
                  type="button"
                  onClick={() => example.current.focus({ preventScroll: true })}
                >
                  Focus the example
                </button>
              )}
              <button type="button" onClick={() => setActivations(0)}>
                Reset
              </button>
            </div>
          </div>
          <div className="story-assertions">
            <span>What the story checks</span>
            <pre>
              <code>{current.code}</code>
            </pre>
            <p>One story documents the component and checks its behavior.</p>
          </div>
        </div>
        <footer className="story-specimen-footer">
          <span>Live example</span>
          <output aria-live="polite">
            {activations} {activations === 1 ? 'activation' : 'activations'}
          </output>
        </footer>
      </section>
    </div>
  );
}
