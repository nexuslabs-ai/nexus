/**
 * No Props Component Fixture
 *
 * Component with no props interface defined.
 * Used for testing extraction of:
 * - Components without explicit props interface
 * - Default HTML element props handling
 * - Edge case where no custom props exist
 */

import * as React from 'react';

/**
 * A simple separator component with no custom props.
 */
function Separator() {
  return <hr data-slot="separator" className="border-border border-t" />;
}

export { Separator };
