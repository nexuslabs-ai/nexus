// Re-export everything from @testing-library/react
export {
  act,
  cleanup,
  findByLabelText,
  findByRole,
  findByTestId,
  findByText,
  fireEvent,
  getByLabelText,
  getByPlaceholderText,
  // Queries
  getByRole,
  getByTestId,
  getByText,
  prettyDOM,
  queryByLabelText,
  queryByRole,
  queryByTestId,
  queryByText,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';

// Re-export userEvent for interaction testing
export { default as userEvent } from '@testing-library/user-event';

// Re-export axe for accessibility testing
export { axe } from 'vitest-axe';

// Export custom render
export { type NexusRenderOptions,render } from './render';

// Export types
export type { RenderResult } from '@testing-library/react';
