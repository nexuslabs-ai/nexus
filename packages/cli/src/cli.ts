import { Command } from 'commander';

import { registerCommands } from './commands/index.js';

const program = new Command();

program.name('nexus').description('Nexus Design System CLI').version('0.1.0');

// Register all commands
registerCommands(program);

// Parse and execute
program.parse();
