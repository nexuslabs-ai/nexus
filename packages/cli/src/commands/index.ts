import type { Command } from 'commander';

/**
 * Register all CLI commands
 * Commands will be added in subsequent phases:
 * - Phase 2: login, logout, whoami, init
 * - Phase 3: add, list, status
 * - Phase 4: update, diff
 * - Phase 5: remove, info, repair
 */
export function registerCommands(_program: Command): void {
  // Commands will be registered here in future phases
  // For now, this is a placeholder to verify the CLI structure works
  // Example of how commands will be added:
  // program
  //   .command('login')
  //   .description('Authenticate with the Nexus registry')
  //   .action(loginCommand);
}
