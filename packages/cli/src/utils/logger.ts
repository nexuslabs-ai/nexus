import chalk from 'chalk';

/**
 * Styled console output for CLI
 */
export const logger = {
  /**
   * Log an info message
   */
  info: (message: string) => console.log(chalk.blue('info'), message),

  /**
   * Log a success message
   */
  success: (message: string) => console.log(chalk.green('success'), message),

  /**
   * Log a warning message
   */
  warn: (message: string) => console.log(chalk.yellow('warn'), message),

  /**
   * Log an error message
   */
  error: (message: string) => console.log(chalk.red('error'), message),

  /**
   * Log a list item with optional detail
   */
  item: (name: string, detail?: string) => {
    const formatted = detail
      ? `  ${chalk.cyan(name)} ${chalk.dim(detail)}`
      : `  ${chalk.cyan(name)}`;
    console.log(formatted);
  },

  /**
   * Log a section header
   */
  section: (title: string) => {
    console.log();
    console.log(chalk.bold(title));
  },

  /**
   * Log a dimmed message
   */
  dim: (message: string) => console.log(chalk.dim(message)),

  /**
   * Print a blank line
   */
  newline: () => console.log(),

  /**
   * Print a formatted table
   */
  table: (rows: string[][]) => {
    if (rows.length === 0) return;

    const maxLengths = rows[0].map((_, i) =>
      Math.max(...rows.map((row) => row[i]?.length ?? 0))
    );

    for (const row of rows) {
      console.log(row.map((cell, i) => cell.padEnd(maxLengths[i])).join('  '));
    }
  },
};
