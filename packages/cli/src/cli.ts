import { Command, CommanderError, Option } from 'commander';
import path from 'node:path';

import { resolveRegistry } from './catalog';
import { CLI_COMMAND } from './cli-command';
import { info, list, search, view } from './commands/browse';
import { diff, doctor } from './commands/check';
import { add, init, update } from './commands/install';
import type { CommandResult } from './commands/result';
import { CliError, EXIT_CODES, type ExitCode } from './errors';
import type { InstallOptions } from './install';

export type Output = {
  out: (text: string) => void;
  err: (text: string) => void;
};

type GlobalOptions = { cwd?: string; registry?: string };

type InstallFlags = { overwrite?: boolean; dryRun?: boolean; install: boolean };

function context(command: Command) {
  const { cwd, registry } = command.optsWithGlobals<GlobalOptions>();
  return {
    cwd: path.resolve(cwd ?? process.cwd()),
    registry: resolveRegistry(registry),
  };
}

function installOptions(command: Command): InstallOptions {
  const flags = command.opts<InstallFlags>();
  return {
    overwrite: flags.overwrite ?? false,
    dryRun: flags.dryRun ?? false,
    install: flags.install,
  };
}

function withInstallFlags(command: Command) {
  return command
    .option('--dry-run', 'show what would change, without changing anything')
    .option('--overwrite', "replace files that differ from nxds's copy")
    .option('--no-install', 'skip installing npm packages');
}

/**
 * The program, with each command's action passing its result to `done`.
 * Output is configured first, since commands copy it when they're added.
 */
function program(
  done: (result: CommandResult) => void,
  write: (text: string) => void
) {
  const cli = new Command()
    .configureOutput({
      writeOut: write,
      writeErr: write,
      // Errors are printed once, by `main`, as text or JSON.
      outputError: () => {},
    })
    .exitOverride()
    .name(CLI_COMMAND)
    .description('Add nxds to your app.')
    .version(__VERSION__, '-v, --version', 'print the version')
    .helpOption('-h, --help', 'show help')
    .helpCommand('help [command]', 'show help for a command')
    .option('--json', 'print machine-readable JSON')
    .option('--cwd <path>', 'run in another folder')
    .addOption(
      new Option(
        '--registry <url|path>',
        'where to get nxds releases (default: https://nxds.dev/r)'
      ).env('NXDS_REGISTRY_URL')
    )
    .configureHelp({ showGlobalOptions: true })
    .addHelpText(
      'after',
      `\nExit codes: 0 done, 1 error, 2 usage error, 3 done with something left for you (conflicts, kept files, manual steps, failed checks).\nDocs: https://nxds.dev/getting-started/install`
    );

  withInstallFlags(
    cli
      .command('init')
      .description('set up nxds: token CSS, provider, and the layout wiring')
      .option(
        '--dir <path>',
        'nxds folder (default: components/nxds, or src/components/nxds)'
      )
  ).action(async (_options, command: Command) => {
    const { cwd, registry } = context(command);
    const { dir } = command.opts<{ dir?: string }>();
    done(await init(cwd, registry, { ...installOptions(command), dir }));
  });

  withInstallFlags(
    cli
      .command('add')
      .description('add components or blocks, and everything they need')
      .argument('<items...>', 'item names, such as button')
  ).action(async (items: string[], _options, command: Command) => {
    const { cwd, registry } = context(command);
    done(await add(cwd, registry, items, installOptions(command)));
  });

  withInstallFlags(
    cli
      .command('update')
      .description(
        'update every installed item to the latest release, merging nxds changes into your edits'
      )
  ).action(async (_options, command: Command) => {
    const { cwd, registry } = context(command);
    done(await update(cwd, registry, installOptions(command)));
  });

  cli
    .command('list')
    .description('list components and blocks')
    .addOption(
      new Option('--kind <kind>', 'only this kind').choices([
        'component',
        'block',
      ])
    )
    .action(async (_options, command: Command) => {
      const { cwd, registry } = context(command);
      const { kind } = command.opts<{ kind?: 'component' | 'block' }>();
      done(await list(cwd, registry, kind));
    });

  cli
    .command('search')
    .description('find items by name or description')
    .argument('<term...>', 'words to look for')
    .action(async (term: string[], _options, command: Command) => {
      const { cwd, registry } = context(command);
      done(await search(cwd, registry, term.join(' ')));
    });

  cli
    .command('view')
    .description("show an item's files, packages and docs link")
    .argument('<item>', 'item name')
    .action(async (item: string, _options, command: Command) => {
      const { cwd, registry } = context(command);
      done(await view(cwd, registry, item));
    });

  cli
    .command('info')
    .description('show what the CLI detects in this app')
    .action((_options, command: Command) => {
      done(info(context(command).cwd));
    });

  cli
    .command('diff')
    .description('compare your nxds files with the latest release')
    .argument('[items...]', 'item names (default: every installed item)')
    .action(async (items: string[], _options, command: Command) => {
      const { cwd, registry } = context(command);
      done(await diff(cwd, registry, items));
    });

  cli
    .command('doctor')
    .description('check that nxds is wired up correctly')
    .action(async (_options, command: Command) => {
      const { cwd, registry } = context(command);
      done(await doctor(cwd, registry));
    });

  return cli;
}

type Outcome =
  | { exitCode: ExitCode; data: unknown; lines: string[] }
  /** `stack` is set for a bug in nxds, not something the person can fix. */
  | { exitCode: ExitCode; error: string; stack?: string };

/** Help or version text commander printed, as a successful result. */
function printed(text: string, key: 'help' | 'version'): Outcome {
  const trimmed = text.trimEnd();
  return {
    exitCode: EXIT_CODES.ok,
    data: { [key]: trimmed },
    lines: [trimmed],
  };
}

function commanderOutcome(error: CommanderError, printedText: string): Outcome {
  if (error.code === 'commander.version') {
    return printed(printedText, 'version');
  }
  // `--help`, `help` and `help <command>` exit 0.
  if (error.exitCode === 0) return printed(printedText, 'help');
  // No command: commander printed the help as an error.
  if (error.code === 'commander.help') {
    return { exitCode: EXIT_CODES.usage, error: printedText.trimEnd() };
  }
  return {
    exitCode: EXIT_CODES.usage,
    error: `${error.message.replace(/^error: /, '')}\nRun \`${CLI_COMMAND} --help\` for the commands and options.`,
  };
}

async function outcome(argv: string[]): Promise<Outcome> {
  let result: CommandResult | undefined;
  let printedText = '';
  const cli = program(
    (done) => {
      result = done;
    },
    (text) => {
      printedText += text;
    }
  );

  try {
    await cli.parseAsync(argv, { from: 'user' });
    if (!result) throw new Error('The command stored no result.');
    return {
      exitCode: result.ok ? EXIT_CODES.ok : EXIT_CODES.attention,
      data: result.data,
      lines: result.lines,
    };
  } catch (error) {
    if (error instanceof CommanderError) {
      return commanderOutcome(error, printedText);
    }
    if (error instanceof CliError) {
      return { exitCode: error.exitCode, error: error.message };
    }
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return {
      exitCode: EXIT_CODES.error,
      error: message,
      stack: stack ?? message,
    };
  }
}

/**
 * Runs the CLI and returns its exit code. With `--json`, `out` gets exactly
 * one object: `{ ok, exitCode, data }`, or `{ ok: false, exitCode, error }`.
 */
export async function main(argv: string[], output: Output): Promise<ExitCode> {
  // Read before parsing, so a bad flag still prints JSON.
  const json = argv.includes('--json');
  const result = await outcome(argv);
  const ok = result.exitCode === EXIT_CODES.ok;

  if (json) {
    const body =
      'error' in result
        ? { ok: false, exitCode: result.exitCode, error: result.error }
        : { ok, exitCode: result.exitCode, data: result.data };
    output.out(`${JSON.stringify(body, null, 2)}\n`);
  } else if ('lines' in result) {
    output.out(`${result.lines.join('\n')}\n`);
  } else if (result.stack !== undefined) {
    output.err(`${result.stack}\n`);
  } else {
    output.err(`${result.error}\n`);
  }
  return result.exitCode;
}
