# Forms and settings

These are editable source recipes, not another form framework. Storybook supplies
sample records and simulated saves; the implementation lives here and takes real
initial values and a save callback from your application.

## Choose one implementation

| Need                                                  | Copy                                                                   | Additional dependency       |
| ----------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| A small settings form with local React state          | `settings-form.tsx`, `settings-layout.tsx` and `settings-fields.tsx`   | None beyond Nexus and React |
| Your app uses React Hook Form                         | `react-hook-form.tsx`, `settings-layout.tsx` and `settings-fields.tsx` | `react-hook-form` 7         |
| Your app uses TanStack Form                           | `tanstack-form.tsx`, `settings-layout.tsx` and `settings-fields.tsx`   | `@tanstack/react-form` 1    |
| Read-only details or temporarily unavailable settings | `settings-display.tsx`                                                 | None beyond Nexus and React |

Do not combine the three editable forms. They demonstrate the same interaction
using different state owners. Keep only the implementation your application uses.
`settings-layout.tsx` holds the shared contract (`SettingsValues`,
`SettingsFormProps`), the validation rules, value normalization and the
status/Save/Cancel shell. `settings-fields.tsx` renders the fields from
per-field bindings. Each form owns its own state and submission lifecycle.

## Connect application data

```tsx
<SettingsForm
  key={profile.id}
  initialValues={{
    name: profile.name,
    email: profile.email,
    updates: profile.updates,
  }}
  onSave={async (values) => {
    await saveProfile(profile.id, values);
  }}
/>
```

`ReactHookFormExample` and `TanStackFormExample` accept the same props. Rename the
copied component for your application. `initialValues` seeds an editing session;
changing it does not overwrite an in-progress draft. Use a record key when
switching records, or deliberately remount after accepting a remote refresh.

`onSave` must resolve only after persistence succeeds and reject on failure.
If using `fetch`, check `response.ok` and throw for unsuccessful responses.
Success establishes the submitted values as the new Cancel baseline. Failure
preserves the draft for retry. Cancel restores the latest successful baseline
and focuses the first field. Pending submission prevents duplicate saves.

The recipes do not reconcile server-normalized values: adapt the save contract
if your server returns canonical values that differ from the submission. The
application also owns authorization, server validation, field-error mapping,
loading data, navigation guards and persistence. Replace the sample validation
rules and fields to fit your data. Treat exception text as user-facing only when
safe to display; otherwise map it to a useful message in your save callback.

## Source and Storybook

The relative imports assume this repository's `patterns/forms` and `components`
layout. When copying into an app, update those paths to its Nexus components;
include their helpers and Nexus styles. This is source reuse inside the current
Nexus setup, not a claim that a standalone installer is complete. External
installation and theme isolation are tracked in
[#794](https://github.com/nexuslabs-ai/nexus/issues/794).

`Patterns/Forms and Settings` shows local state, read-only and disabled examples.
`Patterns/Form Integrations` shows the two library integrations. Their stories
exercise validation, keyboard submission, pending saves, failure/retry, Cancel,
and narrow layouts. The source panels show the ordinary implementation files;
fixtures and test callbacks remain in the stories.
