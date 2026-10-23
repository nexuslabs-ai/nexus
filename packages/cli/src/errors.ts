import { readFileSync } from 'node:fs';

export const EXIT_CODES = {
  ok: 0,
  /** A network or registry failure, an invalid file, or a bug in nxds. */
  error: 1,
  /** A bad flag, unknown command or item, or a missing argument. */
  usage: 2,
  /** The command ran, and left something for the person to do: conflicts, kept files, manual steps or failed checks. */
  attention: 3,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

/** An error the person running the CLI can fix; printed without a stack. */
export class CliError extends Error {
  exitCode: ExitCode = EXIT_CODES.error;
}

/** A command run the wrong way. */
export class UsageError extends CliError {
  override exitCode: ExitCode = EXIT_CODES.usage;
}

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
