import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const IGNORED_FILES = new Set(['.DS_Store']);
const AGENTS_EXTRA_SKILL_PREFIXES = ['modern-web-guidance/'];

export function auditAgentDrift(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const problems = [
    ...auditSharedSkills(repoRoot),
    ...auditCodexAgentMirrors(repoRoot),
    ...auditTokenFilenamePatterns(repoRoot),
  ];

  return {
    ok: problems.length === 0,
    problems,
  };
}

export function auditSharedSkills(repoRoot = REPO_ROOT) {
  const claudeRoot = path.join(repoRoot, '.claude/skills');
  const agentsRoot = path.join(repoRoot, '.agents/skills');
  const problems = [];
  const claudeFiles = listFiles(claudeRoot);
  const agentFiles = listFiles(agentsRoot);
  const claudeSet = new Set(claudeFiles);
  const agentSet = new Set(agentFiles);

  for (const file of claudeFiles) {
    if (!agentSet.has(file)) {
      problems.push(
        problem('missing-agent-skill', file, 'Missing .agents skill mirror')
      );
      continue;
    }

    const claudeText = readText(path.join(claudeRoot, file));
    const agentText = readText(path.join(agentsRoot, file));

    if (normalizeMirrorText(claudeText) !== normalizeMirrorText(agentText)) {
      problems.push(
        problem(
          'skill-content-drift',
          file,
          'Skill content differs between .claude and .agents'
        )
      );
    }
  }

  for (const file of agentFiles) {
    const isAllowedExtra = AGENTS_EXTRA_SKILL_PREFIXES.some((prefix) =>
      file.startsWith(prefix)
    );

    if (!claudeSet.has(file) && !isAllowedExtra) {
      problems.push(
        problem('extra-agent-skill', file, 'Unexpected .agents-only skill')
      );
    }
  }

  return problems;
}

export function auditCodexAgentMirrors(repoRoot = REPO_ROOT) {
  const claudeRoot = path.join(repoRoot, '.claude/agents');
  const codexRoot = path.join(repoRoot, '.codex/agents');
  const problems = [];
  const claudeFiles = listFiles(claudeRoot).filter((file) =>
    file.endsWith('.md')
  );
  const codexFiles = listFiles(codexRoot).filter((file) =>
    file.endsWith('.toml')
  );
  const expectedCodexFiles = new Set(
    claudeFiles.map((file) => file.replace(/\.md$/, '.toml'))
  );
  const codexSet = new Set(codexFiles);

  for (const file of claudeFiles) {
    const codexFile = file.replace(/\.md$/, '.toml');

    if (!codexSet.has(codexFile)) {
      problems.push(
        problem('missing-codex-agent', codexFile, 'Missing .codex agent mirror')
      );
      continue;
    }

    const claudeText = readText(path.join(claudeRoot, file));
    const codexText = readText(path.join(codexRoot, codexFile));
    const claudeFrontmatter = parseClaudeFrontmatter(claudeText);
    const codexHeader = parseCodexAgentHeader(codexText);

    if (claudeFrontmatter.name !== codexHeader.name) {
      problems.push(
        problem(
          'agent-name-drift',
          codexFile,
          'Codex agent name differs from .claude agent'
        )
      );
    }

    if (claudeFrontmatter.description !== codexHeader.description) {
      problems.push(
        problem(
          'agent-description-drift',
          codexFile,
          'Codex agent description differs from .claude agent'
        )
      );
    }

    const claudeBody = stripClaudeFrontmatter(claudeText);
    const codexBody = extractCodexDeveloperInstructions(codexText);

    if (normalizeMirrorText(claudeBody) !== normalizeMirrorText(codexBody)) {
      problems.push(
        problem(
          'agent-body-drift',
          codexFile,
          'Codex agent instructions differ from .claude agent'
        )
      );
    }
  }

  for (const file of codexFiles) {
    if (!expectedCodexFiles.has(file)) {
      problems.push(
        problem('extra-codex-agent', file, 'Unexpected .codex-only agent')
      );
    }
  }

  return problems;
}

export function auditTokenFilenamePatterns(repoRoot = REPO_ROOT) {
  const problems = [];
  const semanticRoot = path.join(repoRoot, 'packages/core/tokens/semantic');
  const actualBaseNames = getTokenNames(semanticRoot, 'base');
  const actualBrandNames = getTokenNames(semanticRoot, 'brands');
  const filesToCheck = [
    path.join(repoRoot, '.claude/agents/contrast-auditor.md'),
    path.join(repoRoot, '.codex/agents/contrast-auditor.toml'),
  ];

  for (const filePath of filesToCheck) {
    const relPath = path.relative(repoRoot, filePath);
    const text = readText(filePath);
    const documentedBaseNames = getDocumentedTokenPattern(text, 'base');
    const documentedBrandNames = getDocumentedTokenPattern(text, 'brands');

    if (!sameSet(documentedBaseNames, actualBaseNames)) {
      problems.push(
        problem(
          'base-pattern-drift',
          relPath,
          'Base token filename pattern differs from token files'
        )
      );
    }

    if (!sameSet(documentedBrandNames, actualBrandNames)) {
      problems.push(
        problem(
          'brand-pattern-drift',
          relPath,
          'Brand token filename pattern differs from token files'
        )
      );
    }
  }

  return problems;
}

function listFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];
  const stack = [''];

  while (stack.length > 0) {
    const relDir = stack.pop();
    const fullDir = path.join(root, relDir);

    for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
      if (IGNORED_FILES.has(entry.name)) {
        continue;
      }

      const relPath = path.join(relDir, entry.name);

      if (entry.isDirectory()) {
        stack.push(relPath);
        continue;
      }

      if (entry.isFile()) {
        files.push(toPosixPath(relPath));
      }
    }
  }

  return files.sort();
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseClaudeFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    return {};
  }

  const fields = {};

  for (const line of match[1].split('\n')) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9-]*):\s*(.*)$/);

    if (field) {
      fields[field[1]] = field[2];
    }
  }

  return fields;
}

function parseCodexAgentHeader(text) {
  return {
    name: extractTomlString(text, 'name'),
    description: extractTomlString(text, 'description'),
  };
}

function stripClaudeFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function extractCodexDeveloperInstructions(text) {
  const match = text.match(
    /^developer_instructions\s*=\s*"""\n?([\s\S]*?)"""$/m
  );

  if (!match) {
    throw new Error('Missing developer_instructions block');
  }

  return match[1];
}

function extractTomlString(text, key) {
  const match = text.match(
    new RegExp(`^${key}\\s*=\\s*("""[\\s\\S]*?"""|'[^']*'|"[^"]*")`, 'm')
  );

  if (!match) {
    return undefined;
  }

  const raw = match[1];

  if (raw.startsWith('"""')) {
    return raw.slice(3, -3);
  }

  return raw.slice(1, -1);
}

function normalizeMirrorText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\]\((?:\.\.\/)+(?:\.claude\/)?rules\//g, '](<RULES>/')
    .replace(/\bClaude\b/g, '<AGENT>')
    .replace(/\bCodex\b/g, '<AGENT>')
    .replace(/`\.claude\/settings\.json`/g, '`<PERMISSION_HOOK_CONFIG>`')
    .replace(/`\.codex\/hooks\.json`/g, '`<PERMISSION_HOOK_CONFIG>`')
    .split('\n')
    .map(normalizeLine)
    .join('\n')
    .trim();
}

function normalizeLine(line) {
  const trimmed = line.trim();

  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    const cells = trimmed.split('|').map((cell) => cell.trim());
    const isSeparator = cells.every(
      (cell) => cell === '' || /^:?-+:?$/.test(cell)
    );

    return cells
      .map((cell) => (isSeparator && cell !== '' ? '---' : cell))
      .join('|');
  }

  return line.trimEnd();
}

function getTokenNames(root, prefix) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const names = new Set();
  const tokenFileRe = new RegExp(`^${prefix}-(.+)-(?:light|dark)\\.json$`);

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const match = entry.name.match(tokenFileRe);

    if (match) {
      names.add(match[1]);
    }
  }

  return [...names].sort();
}

function getDocumentedTokenPattern(text, prefix) {
  const match = text.match(
    new RegExp(`${prefix}-\\{([^}]+)\\}-\\{light,dark\\}\\.json`)
  );

  if (!match) {
    return [];
  }

  return match[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .sort();
}

function sameSet(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function problem(code, file, message) {
  return { code, file, message };
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function printResult(result) {
  if (result.ok) {
    console.log('Agent drift audit passed.');
    return;
  }

  console.error('Agent drift audit failed:');

  for (const item of result.problems) {
    console.error(`- ${item.code}: ${item.file} — ${item.message}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = auditAgentDrift();
  printResult(result);
  process.exit(result.ok ? 0 : 1);
}
