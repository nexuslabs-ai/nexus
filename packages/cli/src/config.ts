import { issueLines, relativePathSchema, versionSchema } from '@nxds/catalog';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { CLI_COMMAND } from './cli-command';
import { CliError, readJson } from './errors';

export const CONFIG_FILE = 'nxds.json';

// Loose, so fields other tools keep in nxds.json survive a rewrite.
const configSchema = z.looseObject({
  /** The CLI installs React only. */
  framework: z.literal('react'),
  /** The nxds release every installed file comes from. */
  version: versionSchema,
  /** The nxds folder, relative to the project root. */
  dir: relativePathSchema,
  /** The nxds CSS entry, relative to the project root. */
  css: relativePathSchema,
  /** Installed items, in install order. */
  items: z.array(z.string()),
});

export type Config = z.infer<typeof configSchema>;

export function configPath(root: string) {
  return path.join(root, CONFIG_FILE);
}

export function readConfig(root: string): Config | null {
  const file = configPath(root);
  if (!existsSync(file)) return null;
  const parsed = configSchema.safeParse(readJson(file));
  if (parsed.success) return parsed.data;
  throw new CliError(
    `${CONFIG_FILE} is not valid:\n${issueLines(parsed.error)
      .map((line) => `  ${line}`)
      .join(
        '\n'
      )}\nFix it, or delete ${CONFIG_FILE} and run \`${CLI_COMMAND} init\` again.`
  );
}

export function requireConfig(root: string): Config {
  const config = readConfig(root);
  if (config) return config;
  throw new CliError(
    `nxds is not set up here. Run \`${CLI_COMMAND} init\` first.`
  );
}

export function writeConfig(root: string, config: Config) {
  writeFileSync(configPath(root), `${JSON.stringify(config, null, 2)}\n`);
}
