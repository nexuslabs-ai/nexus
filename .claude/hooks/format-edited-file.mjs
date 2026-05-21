#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const file = input?.tool_input?.file_path;

if (!file || !/\.(ts|tsx|js|jsx|json|md|css|yml|yaml)$/.test(file)) {
  process.exit(0);
}

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const prettierBin = path.join(projectDir, 'node_modules/.bin/prettier');

if (!existsSync(prettierBin)) process.exit(0);

const result = spawnSync(
  prettierBin,
  ['--write', '--ignore-unknown', '--log-level', 'error', file],
  { cwd: projectDir, stdio: ['ignore', 'pipe', 'pipe'] },
);

if (result.status && result.status !== 0) {
  const err = result.stderr?.toString() || result.stdout?.toString() || '';
  process.stderr.write(`prettier: ${err.trim()}\n`);
}

process.exit(0);
