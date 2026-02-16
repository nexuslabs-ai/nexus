/**
 * Logger Utilities
 *
 * Structured logging for Context Engine.
 * Outputs JSON in production, pretty-printed in development.
 *
 * Configuration is read from environment variables:
 * - CONTEXT_ENGINE_LOG_LEVEL: Minimum log level (debug, info, warn, error)
 * - CONTEXT_ENGINE_LOG_JSON: Output as JSON (true/false)
 */

import {
  getLoggerConfig,
  type LogLevel as ConfigLogLevel,
} from '../config/index.js';

/**
 * Log levels
 */
export type LogLevel = ConfigLogLevel;

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
 * Get default configuration from environment
 */
function getDefaultConfig(): LoggerConfig {
  const envConfig = getLoggerConfig();
  return {
    level: envConfig.level,
    name: 'context-engine',
    json: envConfig.json,
  };
}

/**
 * Create a logger instance
 */
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  return new Logger({ ...getDefaultConfig(), ...config });
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
}

/**
 * Default logger instance
 */
export const logger = createLogger();
