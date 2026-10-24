import { expect, type Mock, userEvent, waitFor, within } from 'storybook/test';

import type {
  SettingsFormProps,
  SettingsValues,
} from '../../patterns/forms/settings-layout';

type SettingsPlayContext = {
  canvasElement: HTMLElement;
  args: { onSave: Mock<SettingsFormProps['onSave']> };
};

// Layout widths can round to the next pixel, so allow one when checking overflow.
const SUBPIXEL_TOLERANCE = 1;

export const slowSave: SettingsFormProps['onSave'] = (values) =>
  new Promise((resolve) => setTimeout(() => resolve(values), 1000));

/** Holds the next save open until the returned function is called. */
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

/** Lets React render updates scheduled after a promise settles. */
function nextFrames() {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
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
  await userEvent.click(save);
  await expectSaved(canvasElement);
  await expect(args.onSave).toHaveBeenCalledWith({
    name: 'Priya Patel',
    email: 'priya@example.com',
    updates: true,
  });
  await expect(name).toHaveValue('Priya Patel');
  await expect(name).toHaveFocus();
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
  await userEvent.type(email, 'invalid');
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
  const email = canvas.getByRole('textbox', { name: 'Email' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.type(name, ' Jr');
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Saving changes')
  );
  await expect(name).toHaveAttribute('readonly');
  await expect(name).toHaveFocus();
  await expect(email).toHaveAttribute('readonly');
  await expect(canvas.getByRole('checkbox')).toBeDisabled();
  await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await expect(save).toHaveAttribute('aria-disabled', 'true');
  await userEvent.keyboard('{Enter}');
  await userEvent.tab();
  await expect(email).toHaveFocus();
  completeSave();
  await expectSaved(canvasElement);
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  await expect(name).not.toHaveAttribute('readonly');
  await expect(email).toHaveFocus();
  await expect(save).toBeDisabled();
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
  await expect(name).toHaveFocus();
  await expect(save).toBeEnabled();
  args.onSave.mockImplementationOnce(() => Promise.reject(undefined));
  await userEvent.click(save);
  await expect(await canvas.findByRole('alert')).toHaveTextContent(
    'Your edits are still here'
  );
  await expect(canvas.getByRole('status')).not.toHaveTextContent(
    'Changes saved'
  );
  await userEvent.click(save);
  await expectSaved(canvasElement);
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  await expect(name).toHaveFocus();
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
  args.onSave.mockImplementationOnce(async (values) => ({
    ...values,
    email: values.email.toLowerCase(),
    id: 'user-42',
  }));
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

/** Needs the `RecordSwitchControls` harness from `settings-form-scenes`. */
export async function verifyRecordSwitch({
  canvasElement,
  args,
}: SettingsPlayContext) {
  const canvas = within(canvasElement);
  const name = () => canvas.getByRole('textbox', { name: 'Name' });
  const save = () => canvas.getByRole('button', { name: 'Save changes' });
  const switchRecord = canvas.getByRole('button', { name: 'Switch record' });
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
  await userEvent.click(switchRecord);
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
  await userEvent.click(switchRecord);
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  const [lateSave] = args.onSave.mock.results;
  completeSave();
  await lateSave?.value;
  await nextFrames();
  await expect(name()).toHaveValue('Priya Shah');
  await expect(canvas.getByRole('status')).toHaveTextContent(
    'No unsaved changes.'
  );
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
}

/** Needs the `EditProfileDialog` harness from `settings-form-scenes`. */
export async function verifyInsideDialog({
  canvasElement,
  args,
}: SettingsPlayContext) {
  const page = within(canvasElement.ownerDocument.body);
  const trigger = within(canvasElement).getByRole('button', {
    name: 'Edit profile',
  });
  await userEvent.click(trigger);
  const dialog = within(
    await page.findByRole('dialog', { name: 'Edit profile' })
  );
  const name = dialog.getByRole('textbox', { name: 'Name' });
  await userEvent.type(name, ' Jr{Enter}');
  await waitFor(() =>
    expect(dialog.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  await expect(name).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
}

export async function verifyNarrow({
  canvasElement,
}: Pick<SettingsPlayContext, 'canvasElement'>) {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByRole('textbox', { name: 'Name' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
  await expect(await canvas.findByRole('alert')).toBeVisible();
  const form = canvas.getByRole('form');
  await expect(form.scrollWidth).toBeLessThanOrEqual(
    form.clientWidth + SUBPIXEL_TOLERANCE
  );
}
