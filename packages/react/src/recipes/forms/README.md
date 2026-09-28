# Forms and settings

These are editable source recipes, not another form framework. Storybook supplies
sample records and simulated saves; the implementation lives here and takes real
initial values and a save callback from your application.

## Choose one implementation

| Need                                                  | Copy                                                                        | Additional dependency       |
| ----------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------- |
| A small settings form with local React state          | `blocks/settings-form.tsx`                                                  | None beyond Nexus and React |
| Your app uses React Hook Form                         | `blocks/react-hook-form-settings-form.tsx` and `blocks/settings-layout.tsx` | `react-hook-form` 7         |
| Your app uses TanStack Form                           | `blocks/tanstack-settings-form.tsx` and `blocks/settings-layout.tsx`        | `@tanstack/react-form` 1    |
| Read-only details or temporarily unavailable settings | `settings-display.tsx`                                                      | None beyond Nexus and React |

Do not combine the three editable forms. They demonstrate the same interaction
using different state owners. Keep only the implementation your application uses.
The shared layout contains presentation and simple value normalization; each
integration owns its own validation and submission lifecycle.

## Connect application data

```tsx
<SettingsForm
  key={profile.id}
  initialValues={{
    name: profile.name,
    email: profile.email,
    updates: profile.updates,
  }}
  onSave={(values) => saveProfile(profile.id, values)}
/>
```

`ReactHookFormSettingsForm` and `TanStackSettingsForm` accept the same props. Rename the
copied component for your application. `initialValues` seeds an editing session;
changing it does not overwrite an in-progress draft. Use a record key when
switching records, or deliberately remount after accepting a remote refresh.

`onSave` must resolve with the saved record only after persistence succeeds, and
reject on failure. If using `fetch`, check `response.ok` and throw for unsuccessful
responses. The record it resolves with becomes the new baseline, so values the
server normalised replace what was typed; only `name`, `email` and `updates` are
kept. Failure preserves the draft for retry and moves focus to Save. Cancel
restores the latest saved values and focuses the first field; a successful save
also focuses the first field. Pending submission prevents duplicate saves.

The application owns authorization, server validation, field-error mapping,
loading data, navigation guards and persistence. Replace the sample validation
rules and fields to fit your data. Treat exception text as user-facing only when
safe to display; otherwise map it to a useful message in your save callback.

## Source and Storybook

The relative imports assume this repository's `recipes/forms` and `components`
layout. When copying into an app, update those paths to its Nexus components;
include their helpers and Nexus styles. This is source reuse inside the current
Nexus setup, not a claim that a standalone installer is complete. External
installation and theme isolation are tracked by the separate adoption work.

`Blocks/SettingsForm`, `Blocks/ReactHookFormSettingsForm` and
`Blocks/TanStackSettingsForm` show the three implementations;
`Patterns/Forms and Settings` shows the read-only and disabled examples. Their stories
exercise validation, keyboard submission, pending saves, failure/retry, Cancel,
and narrow layouts. The source panels show the ordinary implementation files;
fixtures and test callbacks remain in the stories.
