import type { ReactNode } from 'react';

import Link from 'next/link';

import { CodeSample } from '../../_components/CodeSample';
import { SectionHeading, SubsectionHeading } from '../../_components/Heading';
import { InlineCode } from '../../_components/InlineCode';

import {
  DisabledSettings,
  HookFormExample,
  LocalStateExample,
  ReadOnlyDetails,
  TanStackExample,
} from './_forms-examples';

/**
 * Patterns → Forms. Server component — choosing one implementation, wiring
 * application data, what the app owns, then read-only and disabled settings,
 * with the forms as client islands.
 *
 * Source: packages/react/src/patterns/forms/.
 */

const FORM_COMPONENTS =
  'button, button-group/button-group-context.ts, checkbox, field, input, label, separator, spinner and lib/';

const IMPLEMENTATIONS: {
  need: string;
  copy: string;
  components: string;
  dependency: string;
}[] = [
  {
    need: 'A small settings form with local React state',
    copy: 'settings-form.tsx, settings-layout.tsx and settings-fields.tsx',
    components: FORM_COMPONENTS,
    dependency: 'None beyond Nexus and React',
  },
  {
    need: 'Your app uses React Hook Form',
    copy: 'react-hook-form.tsx, settings-layout.tsx and settings-fields.tsx',
    components: FORM_COMPONENTS,
    dependency: 'react-hook-form 7',
  },
  {
    need: 'Your app uses TanStack Form',
    copy: 'tanstack-form.tsx, settings-layout.tsx and settings-fields.tsx',
    components: FORM_COMPONENTS,
    dependency: '@tanstack/react-form 1',
  },
  {
    need: 'Read-only details or temporarily unavailable settings',
    copy: 'settings-display.tsx',
    components:
      'checkbox, description-list, field, input, label, separator and lib/',
    dependency: 'None beyond Nexus and React',
  },
];

const CONNECT_SAMPLE = `<SettingsForm
  key={profile.id}
  title="Profile settings"
  initialValues={{
    name: profile.name,
    email: profile.email,
    updates: profile.updates,
  }}
  onSave={(values) => saveProfile(profile.id, values)}
/>`;

const BODY_CLASS = 'nx:typography-body-default nx:mb-4 nx:max-w-[64ch]';
const SECTION_CLASS = 'nx:typography-heading-small nx:mb-3';
const SUBSECTION_CLASS =
  'nx:typography-label-default nx:font-semibold nx:mt-6 nx:mb-2';
const LINK_CLASS =
  'nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2';

function Example({ children }: { children: ReactNode }) {
  return (
    <div
      data-md-skip
      className="nx:mb-4 nx:min-w-0 nx:max-w-2xl nx:rounded-lg nx:border nx:border-border-default nx:p-4"
    >
      {children}
    </div>
  );
}

export default function Forms() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Forms</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        Build a settings form from Nexus components. Field holds a label, a
        control, help text and an error. FieldSet and FieldLegend group related
        fields. The form comes in three versions: plain React state, React Hook
        Form and TanStack Form.
      </p>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          1. Choose one implementation
        </SectionHeading>
        <div className="nx:mb-4 nx:overflow-x-auto">
          <table className="nx:w-full nx:typography-body-small nx:border-collapse">
            <thead>
              <tr className="nx:text-left nx:border-b nx:border-border-default">
                <th className="nx:py-2 nx:pr-4">Need</th>
                <th className="nx:py-2 nx:pr-4">Copy</th>
                <th className="nx:py-2 nx:pr-4">Component folders</th>
                <th className="nx:py-2">Additional dependency</th>
              </tr>
            </thead>
            <tbody>
              {IMPLEMENTATIONS.map((row) => (
                <tr
                  key={row.need}
                  className="nx:align-top nx:border-b nx:border-border-default"
                >
                  <td className="nx:py-2 nx:pr-4 nx:font-medium">{row.need}</td>
                  <td className="nx:py-2 nx:pr-4">{row.copy}</td>
                  <td className="nx:py-2 nx:pr-4">{row.components}</td>
                  <td className="nx:py-2">{row.dependency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={BODY_CLASS}>
          Copy only the version your app uses.{' '}
          <InlineCode>settings-layout.tsx</InlineCode> holds the shared types,
          validation rules, and the status, Save and Cancel buttons.{' '}
          <InlineCode>settings-fields.tsx</InlineCode> renders the fields.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          2. Connect application data
        </SectionHeading>
        <div className="nx:mb-4">
          <CodeSample lang="tsx">{CONNECT_SAMPLE}</CodeSample>
        </div>
        <p className={BODY_CLASS}>All three versions take the same props:</p>
        <ul className="nx:mb-4 nx:list-disc nx:space-y-2 nx:ps-5 nx:typography-body-default nx:max-w-[64ch]">
          <li>
            <InlineCode>title</InlineCode> names the form. Give each form on a
            page its own title.
          </li>
          <li>
            <InlineCode>initialValues</InlineCode> sets the starting values.
            Changing it later doesn&rsquo;t overwrite what the user is typing.
            To load a different record, change the form&rsquo;s{' '}
            <InlineCode>key</InlineCode>.
          </li>
          <li>
            <InlineCode>onSave</InlineCode> saves the values. It must resolve
            with the saved record, or reject if the save fails.
          </li>
        </ul>
        <p className={BODY_CLASS}>
          With <InlineCode>fetch</InlineCode>, throw when{' '}
          <InlineCode>response.ok</InlineCode> is false. Parse the response into
          the <InlineCode>SettingsValues</InlineCode> shape before you resolve.
          If your API wraps the record, like{' '}
          <InlineCode>{'{ data: … }'}</InlineCode>, unwrap it first.
        </p>
        <p className={BODY_CLASS}>
          After a save, the form shows the record you resolved with, so changes
          your server made replace what the user typed. Fields the form
          doesn&rsquo;t edit are ignored. If the save fails, the user&rsquo;s
          edits stay so they can retry. Cancel restores the last saved values.
          Save is blocked while a save is running.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          3. Local state
        </SectionHeading>
        <p className={BODY_CLASS}>
          Edit a field to enable Save. To see validation, clear the name or
          enter an invalid email, then save. Checkboxes are saved with Save. Use
          a switch only for a change that applies immediately.
        </p>
        <Example>
          <LocalStateExample />
        </Example>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          4. Form libraries
        </SectionHeading>
        <p className={BODY_CLASS}>
          Both versions behave like the local-state form. They validate on save,
          focus the first invalid field, and clear an error when the field is
          edited.
        </p>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          React Hook Form
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Uses <InlineCode>useForm</InlineCode> and{' '}
          <InlineCode>useController</InlineCode>.
        </p>
        <Example>
          <HookFormExample />
        </Example>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          TanStack Form
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Uses <InlineCode>useForm</InlineCode> and{' '}
          <InlineCode>useField</InlineCode>. It detects unsaved changes with{' '}
          <InlineCode>!isDefaultValue</InlineCode>.
        </p>
        <Example>
          <TanStackExample />
        </Example>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          5. Read-only and disabled
        </SectionHeading>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Read-only details
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Use a{' '}
          <Link href="/components/description-list" className={LINK_CLASS}>
            DescriptionList
          </Link>{' '}
          for values the user can read but not edit. Say who can change them,
          and show empty values as &ldquo;Not provided&rdquo; instead of leaving
          them blank.
        </p>
        <Example>
          <ReadOnlyDetails name="Priya Shah" email="priya@example.com" />
        </Example>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Temporarily unavailable
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Disable a control only when it&rsquo;s temporarily unavailable. Show
          the reason, and link it with <InlineCode>aria-describedby</InlineCode>
          .
        </p>
        <Example>
          <DisabledSettings address="24 Riverside Road" />
        </Example>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          6. What the application owns
        </SectionHeading>
        <ul className="nx:mb-4 nx:list-disc nx:space-y-2 nx:ps-5 nx:typography-body-default nx:max-w-[64ch]">
          <li>
            Permissions, server validation, loading data, leave-page warnings
            and saving. Replace the sample fields and validation rules with your
            own.
          </li>
          <li>
            Error messages. A failed save shows a fixed message, never the
            error&rsquo;s own text. To show server errors, edit the submit
            handler.
          </li>
          <li>
            The source lives in{' '}
            <InlineCode>packages/react/src/patterns/forms</InlineCode>. Update
            its imports to point at your copied components.
          </li>
        </ul>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-[64ch]">
          The forms on this page don&rsquo;t save anything.
        </p>
      </section>
    </>
  );
}
