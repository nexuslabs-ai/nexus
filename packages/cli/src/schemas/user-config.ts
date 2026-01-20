import { z } from 'zod';

/**
 * User configuration stored in ~/.nexusrc
 */
export const UserConfigSchema = z.object({
  /** Auth token from login */
  token: z.string().optional(),

  /** When token was last validated with registry */
  lastValidated: z.string().datetime().optional(),

  /** User's email (from auth response) */
  email: z.string().email().optional(),

  /** Organization name */
  organization: z.string().optional(),

  /** Organization ID */
  organizationId: z.string().uuid().optional(),
});

export type UserConfig = z.infer<typeof UserConfigSchema>;
