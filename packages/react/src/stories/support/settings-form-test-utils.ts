import { expect, type Mock, userEvent, waitFor, within } from 'storybook/test';

import type { SettingsValues } from '../../recipes/forms/blocks/settings-layout';

type SettingsPlayContext = {
  canvasElement: HTMLElement;
  args: { onSave: Mock<(values: SettingsValues) => Promise<SettingsValues>> };
};

function controlledSave(args: SettingsPlayContext['args']) {
  let complete: () => void = () => {};
  args.onSave.mockImplementationOnce(
    (values) =>
      new Promise<SettingsValues>((resolve) => {
        complete = () => resolve(values);
      })
  );
  return () => complete();
}

async function expectSaved(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
}

export async function verifySaveCancel({
  canvasElement,
  args,
}: SettingsPlayContext) {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const updates = canvas.getByRole('checkbox', { name: 'Product updates' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await expect(save).toBeDisabled();
  await userEvent.type(name, 'x');
  await expect(save).toBeEnabled();
  await userEvent.keyboard('{Backspace}');
  await expect(save).toBeDisabled();
  await userEvent.click(updates);
  await userEvent.click(updates);
  await expect(save).toBeDisabled();
  await userEvent.clear(name);
  await userEvent.type(name, '  Priya Patel  ');
  await userEvent.click(updates);
  await expect(canvas.getByRole('status')).toHaveTextContent(
    'You have unsaved changes.'
  );
  await userEvent.tab();
  await expect(save).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expectSaved(canvasElement);
  await expect(args.onSave).toHaveBeenCalledWith({
    name: 'Priya Patel',
    email: 'priya@example.com',
    updates: true,
  });
  await expect(name).toHaveValue('Priya Patel');
  await waitFor(() => expect(name).toHaveFocus());
  await userEvent.type(name, ' unsaved');
  await userEvent.click(updates);
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await expect(name).toHaveValue('Priya Patel');
  await expect(name).toHaveFocus();
  await expect(updates).toBeChecked();
  await expect(save).toBeDisabled();
}

export async function verifyValidation({
  canvasElement,
  args,
}: SettingsPlayContext) {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const email = canvas.getByRole('textbox', { name: 'Email' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.clear(name);
  await userEvent.type(name, '   ');
  await userEvent.clear(email);
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(name).toHaveFocus());
  await expect(name).toHaveAccessibleDescription(/Enter your name/);
  await expect(email).toHaveAccessibleDescription(
    /Enter a valid email address/
  );
  await expect(args.onSave).not.toHaveBeenCalled();
  await userEvent.clear(name);
  await userEvent.type(name, 'Priya Shah');
  await expect(name).not.toHaveAccessibleDescription(/Enter your name/);
  await expect(email).toHaveAccessibleDescription(
    /Enter a valid email address/
  );
  await userEvent.type(email, 'still-invalid');
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.click(save);
  await waitFor(() => expect(email).toHaveFocus());
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await userEvent.clear(email);
  await userEvent.type(email, 'priya.shah@example.com');
  await userEvent.click(save);
  await expectSaved(canvasElement);
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
}

export async function verifyPending({
  canvasElement,
  args,
}: SettingsPlayContext) {
  const canvas = within(canvasElement);
  const completeSave = controlledSave(args);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.type(name, ' Jr');
  const form = canvas.getByRole('form');
  if (!(form instanceof HTMLFormElement)) throw new Error('Expected a form');
  form.requestSubmit();
  form.requestSubmit();
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Saving changes')
  );
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  await expect(name).toBeDisabled();
  await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
  await expect(canvas.getByRole('checkbox')).toBeDisabled();
  await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await expect(save).toBeDisabled();
  await userEvent.keyboard('{Enter}');
  save.click();
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  completeSave();
  await expectSaved(canvasElement);
  await expect(name).toBeEnabled();
  await expect(save).toBeDisabled();
  await waitFor(() => expect(name).toHaveFocus());
}

export async function verifyFailure({
  canvasElement,
  args,
}: SettingsPlayContext) {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  args.onSave.mockRejectedValueOnce(new Error('Demo save failed'));
  await userEvent.type(name, ' Jr');
  await userEvent.click(save);
  await expect(await canvas.findByRole('alert')).toHaveTextContent(
    'Your edits are still here'
  );
  await expect(name).toHaveValue('Priya Shah Jr');
  await expect(name).toBeEnabled();
  await expect(save).toBeEnabled();
  await waitFor(() => expect(save).toHaveFocus());
  args.onSave.mockImplementationOnce(() => Promise.reject(undefined));
  await userEvent.click(save);
  await waitFor(() =>
    expect(canvas.getByRole('status')).not.toHaveTextContent('Saving changes')
  );
  await expect(await canvas.findByRole('alert')).toHaveTextContent(
    'Your edits are still here'
  );
  await expect(canvas.getByRole('status')).not.toHaveTextContent(
    'Changes saved'
  );
  await userEvent.click(save);
  await expectSaved(canvasElement);
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.type(name, ' unsaved');
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await expect(name).toHaveValue('Priya Shah Jr');
  await expect(save).toBeDisabled();
}

export async function verifyServerNormalized({
  canvasElement,
  args,
}: SettingsPlayContext) {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const email = canvas.getByRole('textbox', { name: 'Email' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  args.onSave.mockImplementationOnce(async (values) => {
    const persisted = {
      ...values,
      email: values.email.toLowerCase(),
      id: 'user-42',
    };
    return persisted;
  });
  await userEvent.clear(email);
  await userEvent.type(email, 'PRIYA@Example.com');
  await userEvent.click(save);
  await expectSaved(canvasElement);
  await expect(args.onSave).toHaveBeenLastCalledWith({
    name: 'Priya Shah',
    email: 'PRIYA@Example.com',
    updates: false,
  });
  await waitFor(() => expect(email).toHaveValue('priya@example.com'));
  await expect(save).toBeDisabled();
  await userEvent.type(name, ' Jr');
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await expect(email).toHaveValue('priya@example.com');
  await expect(name).toHaveValue('Priya Shah');
  await userEvent.type(name, ' Jr');
  await userEvent.click(save);
  await expectSaved(canvasElement);
  await expect(args.onSave).toHaveBeenLastCalledWith({
    name: 'Priya Shah Jr',
    email: 'priya@example.com',
    updates: false,
  });
}

/**
 * Needs a harness with "Load a newer copy" (same record, new initialValues)
 * and "Switch record" (keyed remount) buttons around the form.
 */
export async function verifyRecordSwitch({
  canvasElement,
  args,
}: SettingsPlayContext) {
  const canvas = within(canvasElement);
  const name = () => canvas.getByRole('textbox', { name: 'Name' });
  const save = () => canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.type(name(), ' draft');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Load a newer copy' })
  );
  await expect(name()).toHaveValue('Priya Shah draft');
  await expect(save()).toBeEnabled();
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await expect(name()).toHaveValue('Priya Shah');
  await userEvent.clear(name());
  await userEvent.click(save());
  await waitFor(() =>
    expect(name()).toHaveAccessibleDescription(/Enter your name/)
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Switch record' }));
  await expect(name()).toHaveValue('Arjun Mehta');
  await expect(name()).not.toHaveAccessibleDescription(/Enter your name/);
  await expect(canvas.getByRole('status')).toHaveTextContent(
    'No unsaved changes.'
  );
  await expect(save()).toBeDisabled();
  const completeSave = controlledSave(args);
  await userEvent.type(name(), ' Jr');
  await userEvent.click(save());
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Saving changes')
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Switch record' }));
  completeSave();
  await expect(name()).toHaveValue('Priya Shah');
  await expect(canvas.getByRole('status')).toHaveTextContent(
    'No unsaved changes.'
  );
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
}

export async function verifyNarrow({
  canvasElement,
}: Pick<SettingsPlayContext, 'canvasElement'>) {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByRole('textbox', { name: 'Name' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
  await expect(await canvas.findByRole('alert')).toBeVisible();
  const form = canvas.getByRole('form');
  await expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth + 1);
}
