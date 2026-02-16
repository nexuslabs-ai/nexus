/**
 * Import Statement Types
 *
 * Defines import statement formats for AI consumption.
 * Supports multiple import forms for different consumer needs.
 */

import { z } from 'zod';

/**
 * Import statement schema
 *
 * Provides multiple import formats for AI assistants to use
 * when generating code with the component.
 *
 * @example
 * ```json
 * {
 *   "primary": "import { Button } from '@nexus/react'",
 *   "typeOnly": "import type { ButtonProps } from '@nexus/react'",
 *   "subpath": "import { Button } from '@nexus/react/button'"
 * }
 * ```
 */
export const ImportStatementSchema = z.object({
  /**
   * Primary import (most common usage)
   * @example "import { Button } from '@nexus/react'"
   */
  primary: z.string(),

  /**
   * Type-only import for props type
   * @example "import type { ButtonProps } from '@nexus/react'"
   */
  typeOnly: z.string().optional(),

  /**
   * Subpath import (if supported by package)
   * @example "import { Button } from '@nexus/react/button'"
   */
  subpath: z.string().optional(),
});

export type ImportStatement = z.infer<typeof ImportStatementSchema>;
