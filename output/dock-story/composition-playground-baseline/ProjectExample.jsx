'use client';

import { useId, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  ChoiceRow,
  ChoiceRowTitle,
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  NativeSelect,
  Textarea,
} from '@nxds/react';

export const INITIAL_PROJECT_SETTINGS = {
  title: 'Create a project',
  description: 'Give your next idea a place to grow.',
  actionLabel: 'Create project',
  buttonVariant: 'default',
  inputVariant: 'bordered',
  showDescription: true,
  showBrief: true,
  showTeam: false,
  showDate: true,
  showPrivacy: true,
};

export function resolveProjectSettings(settings) {
  const result = { ...INITIAL_PROJECT_SETTINGS, ...settings };
  return {
    ...result,
    title: result.title.trim() || INITIAL_PROJECT_SETTINGS.title,
    actionLabel:
      result.actionLabel.trim() || INITIAL_PROJECT_SETTINGS.actionLabel,
  };
}

export function ProjectExample({ settings, className }) {
  const config = resolveProjectSettings(settings);
  const id = useId();
  const [created, setCreated] = useState('');

  function createProject(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const nameInput = form.elements.namedItem('project');
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.setCustomValidity('Enter a project name.');
      nameInput.reportValidity();
      return;
    }
    setCreated(name);
  }

  function clearFeedback(event) {
    event.currentTarget.elements.namedItem('project').setCustomValidity('');
    setCreated('');
  }

  return (
    <Card
      className={`nx:flex nx:flex-col ${className ?? ''}`}
      data-project-example="true"
    >
      <CardHeader className="nx:shrink-0">
        <CardTitle asChild className="nx:break-words">
          <h2>{config.title}</h2>
        </CardTitle>
        {config.showDescription && config.description && (
          <CardDescription className="nx:break-words">
            {config.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="nx:shrink-0">
        <form onSubmit={createProject} onInput={clearFeedback}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${id}-name`}>Project name</FieldLabel>
              <Input
                id={`${id}-name`}
                name="project"
                variant={config.inputVariant}
                defaultValue="Website refresh"
                required
                maxLength={100}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-workspace`}>Workspace</FieldLabel>
              <NativeSelect
                id={`${id}-workspace`}
                name="workspace"
                defaultValue="Design team"
              >
                <option>Design team</option>
                <option>Engineering</option>
                <option>Personal projects</option>
              </NativeSelect>
            </Field>
            {config.showBrief && (
              <Field>
                <FieldLabel htmlFor={`${id}-brief`}>Project brief</FieldLabel>
                <Textarea
                  id={`${id}-brief`}
                  name="brief"
                  rows={3}
                  defaultValue="Bring the new components, content and navigation together."
                />
              </Field>
            )}
            {config.showDate && (
              <Field>
                <FieldLabel htmlFor={`${id}-date`}>Target date</FieldLabel>
                <Input
                  id={`${id}-date`}
                  name="date"
                  type="date"
                  variant={config.inputVariant}
                  defaultValue="2026-11-12"
                />
              </Field>
            )}
            {config.showTeam && (
              <FieldSet>
                <FieldLegend variant="label">Project team</FieldLegend>
                <FieldGroup className="nx:gap-3">
                  {['Sam Rivera', 'Jordan Lee'].map((name, index) => (
                    <ChoiceRow key={name} htmlFor={`${id}-member-${index}`}>
                      <Checkbox
                        id={`${id}-member-${index}`}
                        name="members"
                        value={name}
                        aria-labelledby={`${id}-member-label-${index}`}
                        defaultChecked
                        onCheckedChange={() => setCreated('')}
                      />
                      <ChoiceRowTitle id={`${id}-member-label-${index}`}>
                        {name}
                      </ChoiceRowTitle>
                    </ChoiceRow>
                  ))}
                </FieldGroup>
              </FieldSet>
            )}
            {config.showPrivacy && (
              <ChoiceRow htmlFor={`${id}-private`}>
                <Checkbox
                  id={`${id}-private`}
                  name="private"
                  aria-labelledby={`${id}-private-label`}
                  defaultChecked
                  onCheckedChange={() => setCreated('')}
                />
                <ChoiceRowTitle id={`${id}-private-label`}>
                  Keep this project private
                </ChoiceRowTitle>
              </ChoiceRow>
            )}
            <Button
              type="submit"
              variant={config.buttonVariant}
              className="nx:h-auto nx:min-h-10 nx:whitespace-normal nx:break-words nx:py-2"
            >
              {config.actionLabel}
            </Button>
            <p
              role="status"
              className="nx:m-0 nx:break-words nx:typography-body-small nx:text-muted-foreground"
            >
              {created
                ? `${created} is ready in this demo.`
                : 'Try it. Everything stays in this preview.'}
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
