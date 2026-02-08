/**
 * Server Logger
 *
 * Structured logging for the Context Engine HTTP server using pino.
 *
 * - Development: human-readable via pino-pretty
 * - Production: JSON to stdout (for log aggregators)
 *
 * Request-scoped logging is handled by hono-pino middleware (see app.ts).
 * This module provides the root logger for server lifecycle events
 * (startup, shutdown, fatal errors).
 */

import pino from 'pino';

import { Environment, type ServerConfig } from './config.js';

/**
 * Create a pino logger instance from server config.
 *
 * @param config - Server configuration (uses logLevel and environment)
 * @returns Configured pino logger
 */
export function createServerLogger(config: ServerConfig): pino.Logger {
  const isDev = config.environment !== Environment.Production;

  if (isDev) {
    return pino({
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino({ level: config.logLevel });
}
