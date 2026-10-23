import path from 'node:path';
import { parseArgs } from 'node:util';

import { resolveRegistry } from './catalog';
import { CLI_COMMAND } from './cli-command';
import { info, list, search, view } from './commands/browse';
import { diff, doctor } from './commands/check';
import { add, init, update } from './commands/install';
import type { CommandResult } from './commands/result';
import { CliError } from './errors';

const HELP = `nxds: add nxds to your app.

Usage: ${CLI_COMMAND} <command> [options]

Commands
  init                   Set up nxds: token CSS, provider, and the layout wiring
  add <item...>          Add components or blocks, and everything they need
  list [--kind k]        List components and blocks (k: component, block)
  search <term>          Find items by name or description
  view <item>            Show an item's files, packages and docs link
  info                   Show what the CLI detects in this app
  update                 Update every installed item to the latest release
  diff [item...]         Compare your nxds files with the latest release
  doctor                 Check that nxds is wired up correctly

Options
  --json                 Print machine-readable JSON
  --dry-run              Show what would change, without changing anything
  --overwrite            Replace files that differ from nxds's copy (add, update)
  --no-install           Skip installing npm packages (init, add, update)
  --dir <path>           nxds folder for init (default: components/nxds, or src/components/nxds)
  --cwd <path>           Run in another folder
  --registry <url|path>  Where to get nxds releases (default: https://nxds.dev/r)
  -v, --version          Print the version

Docs: https://nxds.dev/getting-started/install`;

const OPTIONS = {
  json: { type: 'boolean', default: false },
  'dry-run': { type: 'boolean', default: false },
  overwrite: { type: 'boolean', default: false },
  'no-install': { type: 'boolean', default: false },
  dir: { type: 'string' },
  cwd: { type: 'string' },
  registry: { type: 'string' },
  kind: { type: 'string' },
  help: { type: 'boolean', short: 'h', default: false },
  version: { type: 'boolean', short: 'v', default: false },
} as const;

function parseCommandLine() {
  try {
    return parseArgs({ allowPositionals: true, options: OPTIONS });
  } catch (error) {
    throw new CliError(
      `${(error as Error).message}\nRun \`${CLI_COMMAND} --help\` for the options.`
    );
  }
}

type Values = ReturnType<typeof parseCommandLine>['values'];

function text(data: unknown, output: string): CommandResult {
  return { data, lines: [output], ok: true };
}

async function run(
  values: Values,
  positionals: string[]
): Promise<CommandResult> {
  if (values.version) return text({ version: __VERSION__ }, __VERSION__);
  if (values.help || positionals[0] === 'help')
    return text({ help: HELP }, HELP);

  const [command, ...args] = positionals;
  const cwd = path.resolve(values.cwd ?? process.cwd());
  const registry = resolveRegistry(values.registry);
  const installOptions = {
    overwrite: values.overwrite,
    dryRun: values['dry-run'],
    install: !values['no-install'],
  };
  switch (command) {
    case 'init':
      return init(cwd, registry, { ...installOptions, dir: values.dir });
    case 'add':
      return add(cwd, registry, args, installOptions);
    case 'update':
      return update(cwd, registry, args, installOptions);
    case 'list':
      return list(cwd, registry, values.kind);
    case 'search':
      return search(cwd, registry, args.join(' '));
    case 'view':
      return view(cwd, registry, args[0]);
    case 'info':
      return info(cwd);
    case 'diff':
      return diff(cwd, registry, args);
    case 'doctor':
      return doctor(cwd, registry);
    default:
      throw new CliError(
        command
          ? `Unknown command "${command}". Run \`${CLI_COMMAND} --help\`.`
          : HELP
      );
  }
}

/**
 * Prints the result. With `--json`, stdout is always one object:
 * `{ ok, data }`, or `{ ok: false, error }` when the command failed.
 */
async function main() {
  // Read before parsing, so a bad flag still prints JSON.
  const json = process.argv.includes('--json');
  try {
    const { values, positionals } = parseCommandLine();
    const result = await run(values, positionals);
    const output = json
      ? JSON.stringify({ ok: result.ok, data: result.data }, null, 2)
      : result.lines.join('\n');
    process.stdout.write(`${output}\n`);
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    process.exitCode = 1;
    const message = error instanceof Error ? error.message : String(error);
    if (json) {
      process.stdout.write(
        `${JSON.stringify({ ok: false, error: message }, null, 2)}\n`
      );
    } else if (error instanceof CliError) {
      console.error(message);
    } else {
      // A bug in nxds, not something the person can fix: keep the stack.
      console.error(error);
    }
  }
}

await main();
