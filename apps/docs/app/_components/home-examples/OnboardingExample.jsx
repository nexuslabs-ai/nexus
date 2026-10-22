'use client';
import { useId, useRef, useState } from 'react';

import { Button, Input } from '@nxds/react';
export function OnboardingExample() {
  const id = useId();
  const heading = useRef(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Studio North');
  const [purpose, setPurpose] = useState('Design system');
  function advance(event) {
    event.preventDefault();
    setStep(step + 1);
    heading.current?.focus();
  }
  function back() {
    setStep(Math.max(0, step - 1));
    heading.current?.focus();
  }
  return (
    <form className="example-onboarding" onSubmit={advance}>
      <ol className="example-steps" aria-label="Setup progress">
        {['Your space', 'Your focus', 'Ready'].map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? 'step' : undefined}
            data-complete={step > index}
          >
            <span>{step > index ? '✓' : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="example-onboarding-body">
        <div className="example-heading">
          <span className="example-eyebrow">A FRESH START</span>
          <h3 ref={heading} tabIndex={-1}>
            {
              [
                'Great things start here.',
                'What are you building?',
                'You’re ready to begin.',
              ][step]
            }
          </h3>
          <p>
            {
              [
                'Give your workspace a name. You can change it later.',
                'We’ll help you start with the right foundations.',
                'Your next idea has a place to grow.',
              ][step]
            }
          </p>
        </div>
        {step === 0 && (
          <label className="example-field" htmlFor={id}>
            Workspace name
            <Input
              id={id}
              name="workspace"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}
        {step === 1 && (
          <fieldset className="example-choices">
            <legend>Choose a starting point</legend>
            {['Design system', 'Product website', 'Internal tool'].map(
              (value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="purpose"
                    value={value}
                    checked={purpose === value}
                    onChange={() => setPurpose(value)}
                  />
                  {value}
                </label>
              )
            )}
          </fieldset>
        )}
        {step === 2 && (
          <div className="example-summary">
            <span className="example-avatar">✓</span>
            <div>
              <strong>{name}</strong>
              <p>{purpose} · Workspace preview</p>
            </div>
          </div>
        )}
        <div className="example-footer">
          {step > 0 && step < 2 ? (
            <Button variant="ghost" type="button" onClick={back}>
              Back
            </Button>
          ) : (
            <span>Nothing is sent.</span>
          )}
          {step < 2 ? (
            <Button type="submit">Continue →</Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Start again
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
