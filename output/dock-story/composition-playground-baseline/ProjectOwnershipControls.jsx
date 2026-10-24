import { useId, useState } from 'react';

import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  Switch,
  Textarea,
} from '@nxds/react';

import { resolveProjectSettings } from './ProjectExample';
import projectModule from './ProjectExample.jsx?raw';

export function getProjectSource(settings) {
  const component = projectModule.replace(
    /from '@nexus_ds\/react'/g,
    "from '@nxds/react'"
  );
  const configuration = JSON.stringify(
    resolveProjectSettings(settings),
    null,
    2
  );
  return `${component}\n\nconst projectSettings = ${configuration};\n\nexport default function CreateProject() {\n  return <ProjectExample settings={projectSettings} />;\n}\n`;
}

export function ProjectOwnershipControls({
  tool,
  settings,
  onChange,
  onReset,
}) {
  const id = useId();
  const [copyFeedback, setCopyFeedback] = useState(null);
  const source = getProjectSource(settings);

  function update(name, value) {
    onChange({ ...settings, [name]: value });
  }

  async function copySource() {
    try {
      await navigator.clipboard.writeText(source);
      setCopyFeedback({ source, message: 'Complete JSX copied.' });
    } catch {
      setCopyFeedback({
        source,
        message: 'Copy unavailable. Select the source below and copy it.',
      });
    }
  }

  return (
    <div data-slot="project-ownership-controls" className="nx:min-w-0 nx:p-0.5">
      <FieldGroup className="nx:gap-3">
        <FieldDescription className="nx:typography-body-small">
          Editing the Create a project card.
        </FieldDescription>
        {tool === 'Content' && (
          <>
            <Field>
              <FieldLabel htmlFor={`${id}-title`}>Card title</FieldLabel>
              <Input
                id={`${id}-title`}
                value={settings.title}
                maxLength={80}
                onChange={(event) => update('title', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-description`}>Description</FieldLabel>
              <Textarea
                id={`${id}-description`}
                value={settings.description}
                rows={3}
                maxLength={240}
                onChange={(event) => update('description', event.target.value)}
              />
              {!settings.showDescription && (
                <FieldDescription>
                  Hidden. Enable Description in Composition to show it.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-action`}>Button label</FieldLabel>
              <Input
                id={`${id}-action`}
                value={settings.actionLabel}
                maxLength={40}
                onChange={(event) => update('actionLabel', event.target.value)}
              />
            </Field>
          </>
        )}
        {tool === 'Variants' && (
          <>
            <Field>
              <FieldLabel htmlFor={`${id}-button`}>Button variant</FieldLabel>
              <NativeSelect
                id={`${id}-button`}
                value={settings.buttonVariant}
                onChange={(event) =>
                  update('buttonVariant', event.target.value)
                }
              >
                <option value="default">Default</option>
                <option value="outline">Outline</option>
                <option value="secondary">Secondary</option>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-input`}>Input variant</FieldLabel>
              <NativeSelect
                id={`${id}-input`}
                value={settings.inputVariant}
                onChange={(event) => update('inputVariant', event.target.value)}
                aria-describedby={`${id}-input-help`}
              >
                <option value="bordered">Bordered</option>
                <option value="borderless">Borderless</option>
                <option value="ghost">Ghost</option>
              </NativeSelect>
              <FieldDescription id={`${id}-input-help`}>
                Applies to project name and target date.
              </FieldDescription>
            </Field>
          </>
        )}
        {tool === 'Composition' && (
          <>
            {[
              ['showDescription', 'Description'],
              ['showBrief', 'Project brief'],
              ['showDate', 'Target date'],
              ['showTeam', 'Project team'],
              ['showPrivacy', 'Privacy choice'],
            ].map(([name, label]) => (
              <Field
                key={name}
                orientation="horizontal"
                className="nx:min-h-10 nx:items-center nx:rounded-md nx:bg-container nx:px-3 nx:py-1"
              >
                <FieldLabel htmlFor={`${id}-${name}`} className="nx:flex-1">
                  {label}
                </FieldLabel>
                <Switch
                  id={`${id}-${name}`}
                  checked={settings[name]}
                  onCheckedChange={(checked) => update(name, checked)}
                />
              </Field>
            ))}
          </>
        )}
        {tool === 'Source' && (
          <>
            <FieldDescription className="nx:typography-body-small">
              The rendered component and your current settings. Use with Nexus
              installed and its styles and appearance provider loaded.
            </FieldDescription>
            <Button onClick={copySource} type="button" size="sm">
              Copy complete JSX
            </Button>
            <Field>
              <FieldLabel htmlFor={`${id}-source`}>Complete JSX</FieldLabel>
              <Textarea
                id={`${id}-source`}
                value={source}
                readOnly
                rows={10}
                spellCheck={false}
                className="nx:font-mono nx:text-xs"
              />
            </Field>
            <p
              role="status"
              className="nx:m-0 nx:typography-body-small nx:text-muted-foreground"
            >
              {copyFeedback?.source === source
                ? copyFeedback.message
                : 'Includes the form and local demo submission.'}
            </p>
          </>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Reset project example
        </Button>
      </FieldGroup>
    </div>
  );
}
