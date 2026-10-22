'use client';
import { useId, useState } from 'react';

import { Button, Input, Switch } from '@nxds/react';

export function SettingsExample() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  function save(event) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <form
      className="example-form"
      onSubmit={save}
      onChange={() => setSaved(false)}
    >
      <div className="example-heading">
        <span className="example-eyebrow">WORKSPACE / GENERAL</span>
        <h3>A space for your team.</h3>
        <p>Make it yours. Keep everyone in the loop.</p>
      </div>
      <div className="example-identity">
        <span className="example-avatar">S</span>
        <div>
          <strong>Studio North</strong>
          <p>Designing what comes next.</p>
        </div>
        <span className="example-badge">Pro workspace</span>
      </div>
      <div className="example-fields">
        <label htmlFor={`${id}-name`}>
          Workspace name
          <Input
            id={`${id}-name`}
            name="workspace"
            required
            defaultValue="Studio North"
          />
        </label>
        <label htmlFor={`${id}-email`}>
          Contact email
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue="hello@studio.example"
          />
        </label>
      </div>
      <div className="example-preference">
        <div>
          <label htmlFor={`${id}-updates`}>Project updates</label>
          <p>A heads-up when something moves forward.</p>
        </div>
        <Switch
          id={`${id}-updates`}
          defaultChecked
          onCheckedChange={() => setSaved(false)}
        />
      </div>
      <div className="example-preference">
        <div>
          <label htmlFor={`${id}-digest`}>Weekly digest</label>
          <p>The week’s progress, in one email.</p>
        </div>
        <Switch id={`${id}-digest`} onCheckedChange={() => setSaved(false)} />
      </div>
      <div className="example-footer">
        <span role="status">
          {saved
            ? 'Changes saved for this preview.'
            : 'A live example. Nothing is sent.'}
        </span>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
