/**
 * Run setup.sql to add pgvector features
 *
 * This script runs AFTER drizzle-kit push creates the base tables.
 * It adds pgvector-specific features that Drizzle doesn't support natively:
 * - pgvector extension
 * - vector column on embedding_chunks
 * - HNSW index for similarity search
 * - tsvector trigger for full-text search
 *
 * Usage: yarn db:setup
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  // Read setup.sql (one directory up from scripts/)
  const setupSqlPath = join(__dirname, '..', 'setup.sql');

  let sqlContent: string;
  try {
    sqlContent = readFileSync(setupSqlPath, 'utf-8');
  } catch (_error) {
    console.error(`❌ Could not read setup.sql at ${setupSqlPath}`);
    process.exit(1);
  }

  // Connect to database
  const sql = postgres(databaseUrl);

  try {
    console.log('🔧 Running setup.sql for pgvector...');
    console.log('   - Enabling pgvector extension');
    console.log('   - Adding vector column to embedding_chunks');
    console.log('   - Creating HNSW index for similarity search');
    console.log('   - Setting up tsvector trigger for full-text search');

    await sql.unsafe(sqlContent);

    console.log('✅ pgvector setup complete!');
  } catch (error) {
    console.error(
      '❌ Setup failed:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
