import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { CliError, readJson } from './errors';

export const CONFIG_FILE = 'nxds.json';

export type Config = {
  /** The CLI installs React only. */
  framework: 'react';
  /** The nxds release every installed file comes from. */
  version: string;
  /** The nxds folder, relative to the project root. */
  dir: string;
  /** The nxds CSS entry, relative to the project root. */
  css: string;
  /** Installed items, in install order. */
  items: string[];
};

export function configPath(root: string) {
  return path.join(root, CONFIG_FILE);
}

/**
 * `value` as a POSIX path inside the project, such as `src/components/nxds`,
 * or null when it is absolute or leaves the project.
 */
export function projectPath(value: string) {
  const normalized = path.posix
    .normalize(value.replaceAll('\\', '/'))
    .replace(/\/+$/, '');
  if (
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized === '.' ||
    normalized === '..' ||
    normalized.startsWith('../')
  ) {
    return null;
  }
  return normalized;
}

/** The first field of `value` that doesn't have a `Config`'s shape, or null. */
function invalidField(value: Record<string, unknown>) {
  if (value.framework !== 'react') return 'framework';
  if (typeof value.version !== 'string') return 'version';
  for (const field of ['dir', 'css'] as const) {
    const file = value[field];
    if (typeof file !== 'string' || projectPath(file) !== file) return field;
  }
  const { items } = value;
  if (!Array.isArray(items) || !items.every((item) => typeof item === 'string'))
    return 'items';
  return null;
}

export function readConfig(root: string): Config | null {
  const file = configPath(root);
  if (!existsSync(file)) return null;
  const value = readJson(file);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new CliError(`${CONFIG_FILE} must be a JSON object.`);
  }
  const field = invalidField(value as Record<string, unknown>);
  if (field === null) return value as Config;
  throw new CliError(
    `${CONFIG_FILE} has a missing or invalid "${field}". Fix it, or delete ${CONFIG_FILE} and run \`nxds init\` again.`
  );
}

export function requireConfig(root: string): Config {
  const config = readConfig(root);
  if (config) return config;
  throw new CliError(`nxds is not set up here. Run \`nxds init\` first.`);
}

export function writeConfig(root: string, config: Config) {
  writeFileSync(configPath(root), `${JSON.stringify(config, null, 2)}\n`);
}
