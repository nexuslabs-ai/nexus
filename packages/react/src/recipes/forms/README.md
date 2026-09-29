# Forms and settings — file map

Forms is the second family held to the recipes handoff checklist
(`recipes/README.md`). Behaviour, the save contract and delivery live on the
Storybook pages that test them; this file only maps the source.

| Where to read                 | What it covers                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `Patterns/Forms and Settings` | Editable, read-only or unavailable; which block owns the form state                          |
| `Blocks/*SettingsForm`        | Each block's purpose, the shared save contract, notes, delivery and the stories that test it |

## Files

**Blocks** — copy-source, not package exports. Copy only the block your app
uses; the three are alternatives, not layers.

| Files                                      | Block                           | Extra dependency         |
| ------------------------------------------ | ------------------------------- | ------------------------ |
| `blocks/settings-form.tsx`                 | SettingsForm: plain React state | None                     |
| `blocks/react-hook-form-settings-form.tsx` | ReactHookFormSettingsForm       | `react-hook-form` 7      |
| `blocks/tanstack-settings-form.tsx`        | TanStackSettingsForm            | `@tanstack/react-form` 1 |

Every block also needs `blocks/settings-layout.tsx` and
`blocks/settings-fields.tsx`, which have no dependency beyond React and the
Nexus components. `settings-layout.tsx` is the one contract module:
`SettingsValues`, `SettingsFormProps`, the validation rules, trimming, the
saved-record mapping, the failure copy and the status/Save/Cancel shell.
`settings-fields.tsx` renders the fields from per-field bindings.

**Examples**

| File                   | Example                                                |
| ---------------------- | ------------------------------------------------------ |
| `settings-display.tsx` | Read-only details and temporarily unavailable settings |

Do not copy `*.stories.tsx`; they hold tests and sample records. None of these
files ship in the package `dist`.

## Application boundary

Applications own loading the record, authorization, server validation,
navigation guards and persistence. `onSave` has no field-error channel, so
showing server errors on individual fields means editing the copied block. `onSave`
resolves with the saved record and rejects on failure; render the form with
`key={record.id}` so switching records starts a fresh session.

## Readiness

Experimental. Every behaviour in the save contract is pinned by a story on each
block's own page. Light/dark and density evidence, and a re-run of the keyboard
and Dialog checks, wait for the styling isolation work in
[#796](https://github.com/nexuslabs-ai/nexus/issues/796).
