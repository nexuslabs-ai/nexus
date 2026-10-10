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
  onSave={async (values) => {
    await saveProfile(profile.id, values);
  }}
/>`;

const BODY_CLASS = 'nx:typography-body-default nx:mb-4 nx:max-w-[64ch]';
const SECTION_CLASS = 'nx:typography-heading-small nx:mb-3';
const SUBSECTION_CLASS =
  'nx:typography-label-default nx:font-semibold nx:mt-6 nx:mb-2';
const LINK_CLASS =
  'nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2';

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="nx:mb-4 nx:min-w-0 nx:max-w-2xl nx:rounded-lg nx:border nx:border-border-default nx:p-4">
      {children}
    </div>
  );
}

export default function Forms() {
  return (
    <>
      <h1 className="nx:typography-heading-large">Forms</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-8 nx:max-w-[64ch]">
        A settings form built from existing Nexus components, not another form
        framework. Field carries a label, control, help and error; FieldSet and
        FieldLegend group related fields; native form submission drives Save.
        The same interaction ships three ways, one per state owner.
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
          Manual guidance: the component folders are listed by hand and include
          the folders they import.
        </p>
        <p className={BODY_CLASS}>
          Do not combine the three editable forms; keep only the one your
          application uses. <InlineCode>settings-layout.tsx</InlineCode> holds
          the shared contract, validation rules, value normalization and the
          status, Save and Cancel shell.{' '}
          <InlineCode>settings-fields.tsx</InlineCode> renders the fields from
          per-field bindings. Each form owns its own state and submission
          lifecycle.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          2. Connect application data
        </SectionHeading>
        <div className="nx:mb-4">
          <CodeSample lang="tsx">{CONNECT_SAMPLE}</CodeSample>
        </div>
        <p className={BODY_CLASS}>
          All three forms take the same props. <InlineCode>title</InlineCode>{' '}
          names the form; give each form on a page a distinct one.{' '}
          <InlineCode>initialValues</InlineCode> seeds an editing session;
          changing it does not overwrite an in-progress draft. Use a record{' '}
          <InlineCode>key</InlineCode> when switching records, or deliberately
          remount after accepting a remote refresh.
        </p>
        <p className={BODY_CLASS}>
          <InlineCode>onSave</InlineCode> must resolve only after persistence
          succeeds and reject on failure. With <InlineCode>fetch</InlineCode>,
          check <InlineCode>response.ok</InlineCode> and throw for unsuccessful
          responses. Success makes the submitted values the new Cancel baseline;
          failure keeps the draft for retry. Cancel restores the latest saved
          values and focuses the first field. A pending save blocks duplicates.
        </p>
      </section>

      <section className="nx:mb-12">
        <SectionHeading className={SECTION_CLASS}>
          3. Local state
        </SectionHeading>
        <p className={BODY_CLASS}>
          Edit a field to enable Save. Clear the name or enter an invalid email
          and submit to see validation. Checkboxes participate in Save; switches
          are for changes that apply immediately.
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
          Both validate on submit, clear a field error when it is edited, focus
          the first invalid field, keep edits when a save fails, and restore the
          latest saved values on Cancel.
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
          <InlineCode>useField</InlineCode> with subscriptions. Unsaved state
          reads <InlineCode>!isDefaultValue</InlineCode> rather than the
          historical <InlineCode>isDirty</InlineCode>.
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
          when values are information rather than editable controls. Explain who
          can change them, and keep empty values explicit.
        </p>
        <Example>
          <ReadOnlyDetails name="Priya Shah" email="priya@example.com" />
        </Example>
        <SubsectionHeading className={SUBSECTION_CLASS}>
          Temporarily unavailable
        </SubsectionHeading>
        <p className={BODY_CLASS}>
          Disabled controls are temporarily unavailable. Give a visible reason
          and connect it with <InlineCode>aria-describedby</InlineCode>.
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
            Authorization, server validation, loading data, navigation guards
            and persistence. Replace the sample validation rules and fields to
            fit your data.
          </li>
          <li>
            Server-normalized values: the forms do not reconcile them, so adapt
            the save contract if your server returns canonical values that
            differ from the submission.
          </li>
          <li>
            Error text: a rejected save always shows the recipe’s fixed failure
            message, and the exception text is never displayed. To show server
            messages or map server errors onto fields, edit the recipe’s submit
            handler.
          </li>
          <li>
            The source lives in{' '}
            <InlineCode>packages/react/src/patterns/forms</InlineCode>. Its
            relative imports assume this repository’s layout; update them to
            your Nexus components when copying.
          </li>
        </ul>
        <p className="nx:typography-body-default nx:text-muted-foreground nx:max-w-[64ch]">
          The save callback on this page waits briefly and persists nothing.
        </p>
      </section>
    </>
  );
}
