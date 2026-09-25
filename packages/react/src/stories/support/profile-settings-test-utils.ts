import { expect, type Mock, userEvent, waitFor, within } from 'storybook/test';

import type { SaveProfile } from './profile-settings';

type ProfilePlayContext = {
  canvasElement: HTMLElement;
  args: { onSave: Mock<SaveProfile> };
};

export async function verifyProfileSaveCancel({
  canvasElement,
  args,
}: ProfilePlayContext) {
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
  await userEvent.type(name, 'Priya Patel');
  await userEvent.click(updates);
  await expect(canvas.getByRole('status')).toHaveTextContent(
    'You have unsaved changes.'
  );
  await userEvent.click(save);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(args.onSave).toHaveBeenCalledWith({
    name: 'Priya Patel',
    email: 'priya@example.com',
    updates: true,
  });
  await userEvent.type(name, ' unsaved');
  await userEvent.click(updates);
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await expect(name).toHaveValue('Priya Patel');
  await expect(name).toHaveFocus();
  await expect(updates).toBeChecked();
  await expect(save).toBeDisabled();
}

export async function verifyProfileValidation({
  canvasElement,
  args,
}: ProfilePlayContext) {
  const canvas = within(canvasElement);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const email = canvas.getByRole('textbox', { name: 'Email' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.clear(name);
  await userEvent.clear(email);
  await userEvent.type(email, 'invalid');
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(name).toHaveFocus());
  await expect(name).toHaveAccessibleDescription(/Enter your name/);
  await expect(email).toHaveAccessibleDescription(
    /Enter a valid email address/
  );
  await expect(args.onSave).not.toHaveBeenCalled();
  await userEvent.type(name, 'Priya Shah');
  await userEvent.type(email, 'still-invalid');
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.click(save);
  await waitFor(() => expect(email).toHaveFocus());
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await userEvent.clear(email);
  await userEvent.type(email, 'priya.shah@example.com');
  await userEvent.click(save);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
}

export async function verifyProfilePending({
  canvasElement,
  args,
}: ProfilePlayContext) {
  const canvas = within(canvasElement);
  let completeSave: () => void = () => {};
  const response = new Promise<void>((resolve) => {
    completeSave = resolve;
  });
  args.onSave.mockImplementationOnce(() => response);
  const name = canvas.getByRole('textbox', { name: 'Name' });
  const save = canvas.getByRole('button', { name: 'Save changes' });
  await userEvent.type(name, ' Jr');
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Saving changes')
  );
  await expect(name).toBeDisabled();
  await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
  await expect(canvas.getByRole('checkbox')).toBeDisabled();
  await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await expect(save).toBeDisabled();
  completeSave();
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(args.onSave).toHaveBeenCalledTimes(1);
  await expect(name).toBeEnabled();
  await expect(save).toBeDisabled();
}

export async function verifyProfileSaveFailure({
  canvasElement,
  args,
}: ProfilePlayContext) {
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
  await userEvent.click(save);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved')
  );
  await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  await userEvent.type(name, ' unsaved');
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
  await expect(name).toHaveValue('Priya Shah Jr');
  await expect(save).toBeDisabled();
}

export async function verifyProfileNarrowFit({
  canvasElement,
}: Pick<ProfilePlayContext, 'canvasElement'>) {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByRole('textbox', { name: 'Name' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
  await expect(await canvas.findByRole('alert')).toBeVisible();
  const form = canvas.getByRole('form');
  await expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth + 1);
}
