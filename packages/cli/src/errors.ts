import { readFileSync } from 'node:fs';

/** How the person runs the CLI, for usage lines and hints. */
export const CLI_COMMAND = 'npx nxds-cli@latest';

/** An error the person running the CLI can fix; printed without a stack. */
export class CliError extends Error {}

export function readJson(file: string): unknown {
  const text = readFileSync(file, 'utf8');
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new CliError(
      `${file} is not valid JSON (${(error as Error).message}). Fix it, then run the command again.`
    );
  }
}
