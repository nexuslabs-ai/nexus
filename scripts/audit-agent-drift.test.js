import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  auditAgentDrift,
  auditCodexAgentMirrors,
  auditSharedSkills,
  auditTokenFilenamePatterns,
} from './audit-agent-drift.js';

const tempDirs = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

function makeRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-agent-drift-'));
  tempDirs.push(dir);

  for (const [file, content] of Object.entries(files)) {
    const fullPath = path.join(dir, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  return dir;
}

function makeTokenFiles(names, prefix) {
  return Object.fromEntries(
    names.flatMap((name) => [
      [`packages/core/tokens/semantic/${prefix}-${name}-light.json`, '{}'],
      [`packages/core/tokens/semantic/${prefix}-${name}-dark.json`, '{}'],
    ])
  );
}

function makeMinimalRepo(overrides = {}) {
  const brandPattern =
    overrides.brandPattern ?? 'blue,purple,pink,teal,orange,black';
  const claudeAgentBody = [
    '# Contrast Auditor',
    '',
    '| Filename pattern                                                | Path |',
    '| --------------------------------------------------------------- | ---- |',
    '| `base-{slate,neutral,gray,stone,zinc}-{light,dark}.json`        | x    |',
    '| `brands-{blue,purple,pink,teal,orange,black}-{light,dark}.json` | x    |',
    '',
    'The project PermissionRequest hook at `.claude/settings.json` blocks sensitive shell commands.',
  ].join('\n');
  const codexAgentBody = [
    '# Contrast Auditor',
    '',
    '| Filename pattern                                                | Path |',
    '| --------------------------------------------------------------- | ---- |',
    '| `base-{slate,neutral,gray,stone,zinc}-{light,dark}.json`        | x    |',
    `| \`brands-{${brandPattern}}-{light,dark}.json\` | x    |`,
    '',
    'The project PermissionRequest hook at `.codex/hooks.json` blocks sensitive shell commands.',
  ].join('\n');

  return makeRepo({
    '.claude/skills/review/SKILL.md':
      'Load [code-quality.md](../../rules/code-quality.md).\nKeep everything Claude writes tight.\n',
    '.agents/skills/review/SKILL.md':
      'Load [code-quality.md](../../../.claude/rules/code-quality.md).\nKeep everything Codex writes tight.\n',
    '.agents/skills/modern-web-guidance/SKILL.md': 'Codex-only skill.\n',
    '.claude/agents/contrast-auditor.md': [
      '---',
      'name: contrast-auditor',
      'description: Audits contrast.',
      '---',
      '',
      claudeAgentBody,
    ].join('\n'),
    '.codex/agents/contrast-auditor.toml': [
      'name = "contrast-auditor"',
      'description = "Audits contrast."',
      'developer_instructions = """',
      codexAgentBody,
      '"""',
    ].join('\n'),
    ...makeTokenFiles(['slate', 'neutral', 'gray', 'stone', 'zinc'], 'base'),
    ...makeTokenFiles(
      ['blue', 'purple', 'pink', 'teal', 'orange', 'black'],
      'brands'
    ),
  });
}

describe('audit-agent-drift', () => {
  it('passes for the current repository', () => {
    expect(auditAgentDrift().problems).toEqual([]);
  });

  it('allows expected shared skill path and agent-name differences', () => {
    const repoRoot = makeMinimalRepo();

    expect(auditSharedSkills(repoRoot)).toEqual([]);
  });

  it('allows expected Codex agent TOML wrapping differences', () => {
    const repoRoot = makeMinimalRepo();

    expect(auditCodexAgentMirrors(repoRoot)).toEqual([]);
  });

  it('detects stale token filename patterns in mirrored agent docs', () => {
    const repoRoot = makeMinimalRepo({
      brandPattern: 'blue,gray,neutral,slate,stone',
    });

    expect(auditTokenFilenamePatterns(repoRoot)).toEqual([
      {
        code: 'brand-pattern-drift',
        file: '.codex/agents/contrast-auditor.toml',
        message: 'Brand token filename pattern differs from token files',
      },
    ]);
  });

  it('detects shared skill content drift after allowed normalization', () => {
    const repoRoot = makeMinimalRepo();
    fs.appendFileSync(
      path.join(repoRoot, '.agents/skills/review/SKILL.md'),
      '\nUnexpected extra instruction.\n'
    );

    expect(auditSharedSkills(repoRoot)).toEqual([
      {
        code: 'skill-content-drift',
        file: 'review/SKILL.md',
        message: 'Skill content differs between .claude and .agents',
      },
    ]);
  });
});
