import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  auditAgentDrift,
  auditCodexAgentMirrors,
  auditSharedSkills,
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

function makeMinimalRepo(overrides = {}) {
  const codexExtraLine = overrides.codexExtraLine ?? '';
  const claudeAgentBody = [
    '# Contrast Auditor',
    '',
    'Run the APCA vitest sweep.',
    '',
    'The project PermissionRequest hook at `.claude/settings.json` blocks sensitive shell commands.',
  ].join('\n');
  const codexAgentBody = [
    '# Contrast Auditor',
    '',
    'Run the APCA vitest sweep.',
    ...(codexExtraLine ? [codexExtraLine] : []),
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

  it('detects Codex agent body drift', () => {
    const repoRoot = makeMinimalRepo({
      codexExtraLine: 'Unexpected extra agent instruction.',
    });

    expect(auditCodexAgentMirrors(repoRoot)).toEqual([
      {
        code: 'agent-body-drift',
        file: 'contrast-auditor.toml',
        message: 'Codex agent instructions differ from .claude agent',
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
