/** The save and cancel contract all three settings form blocks share. */
export function SettingsFormContract() {
  return (
    <ul>
      <li>
        <code>initialValues</code> seeds an editing session. Passing new values
        for the same record does not overwrite an edit in progress; render the
        form with <code>key={'{record.id}'}</code> so switching records starts a
        fresh session.
      </li>
      <li>
        Save is enabled only when something changed. Validation runs on submit,
        including Enter from a text field, and focus moves to the first invalid
        field. Editing a field clears only that field’s error.
      </li>
      <li>
        Surrounding spaces are trimmed before <code>onSave</code>. While the
        save is in flight, fields and actions are disabled and a second submit
        is ignored.
      </li>
      <li>
        <code>onSave</code> resolves with the saved record. That record becomes
        the new baseline, so values the server normalised replace what was
        typed; only <code>name</code>, <code>email</code> and{' '}
        <code>updates</code> are kept. Focus returns to the first field.
      </li>
      <li>
        If <code>onSave</code> rejects, with or without an error, the edits
        stay, an error explains what happened and focus moves to Save to retry.
      </li>
      <li>
        Cancel restores the latest saved values and focuses the first field.
      </li>
    </ul>
  );
}
