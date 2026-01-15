/**
 * Logger Utilities
 *
 * Structured logging for Context Engine.
 * Outputs JSON in production, pretty-printed in development.
 */

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log level numeric values (for filtering)
 */
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  level: LogLevel;
  /** Logger name/context */
  name: string;
  /** Whether to output in JSON format */
  json: boolean;
  /** Additional default context */
  defaultContext?: Record<string, unknown>;
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  name: string;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  name: 'context-engine',
  json: process.env.NODE_ENV === 'production',
};

/**
 * Create a logger instance
 */
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  return new Logger({ ...DEFAULT_CONFIG, ...config });
}

/**
 * Logger class
 */
export class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, unknown>): Logger {
    return new Logger({
      ...this.config,
      defaultContext: {
        ...this.config.defaultContext,
        ...context,
      },
    });
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[this.config.level];
  }

  /**
   * Format and output a log entry
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      name: this.config.name,
      message,
      context: {
        ...this.config.defaultContext,
        ...context,
      },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.output(entry);
  }

  /**
   * Output a log entry
   */
  private output(entry: LogEntry): void {
    const output = this.config.json
      ? JSON.stringify(entry)
      : this.formatPretty(entry);

    /* eslint-disable no-console -- Logger utility intentionally uses console methods */
    switch (entry.level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
    /* eslint-enable no-console */
  }

  /**
   * Format entry for development (pretty print)
   */
  private formatPretty(entry: LogEntry): string {
    const levelColors: Record<LogLevel, string> = {
      debug: '\x1b[90m', // Gray
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    const color = levelColors[entry.level];

    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.name}: ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n${entry.error.stack}`;
      }
    }

    return output;
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Log at info level
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log at error level
   */
  error(
    message: string,
    error?: Error | Record<string, unknown>,
    context?: Record<string, unknown>
  ): void {
    if (error instanceof Error) {
      this.log('error', message, context, error);
    } else {
      this.log('error', message, { ...error, ...context });
    }
  }

  /**
   * Log operation timing
   */
  time<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.debug(`${operation} completed`, {
        durationMs: Math.round(duration),
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${operation} failed`, error as Error, {
        durationMs: Math.round(duration),
      });
      throw error;
    }
  }

  /**
   * Log async operation timing
   */
  async timeAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`${operation} completed`, {
        durationMs: Math.round(duration),
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${operation} failed`, error as Error, {
        durationMs: Math.round(duration),
      });
      throw error;
    }
  }
}

/**
 * Default logger instance
 */
export const logger = createLogger();
