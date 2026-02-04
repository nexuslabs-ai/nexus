import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit configuration for @context-engine/db
 *
 * We use `db:push` for development - no migrations needed.
 * This directly syncs the schema to the database.
 *
 * Usage:
 *   DATABASE_URL=postgres://... yarn workspace @context-engine/db db:push
 */
export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
});
