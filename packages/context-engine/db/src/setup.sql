-- =============================================================================
-- Vector Search Setup
-- Run this after Drizzle push/generate creates the base tables
-- =============================================================================

-- Enable pgvector extension (requires superuser or extension already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- -----------------------------------------------------------------------------
-- tsvector trigger for full-text search on components
-- -----------------------------------------------------------------------------

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS components_search_vector_idx
ON components USING GIN (search_vector);

-- Trigger to auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION components_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.manifest->>'description', '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.manifest->'guidance'->>'semanticDescription', '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS components_search_vector_trigger ON components;
CREATE TRIGGER components_search_vector_trigger
  BEFORE INSERT OR UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION components_search_vector_update();

-- -----------------------------------------------------------------------------
-- Vector column and HNSW index for embedding_chunks
-- -----------------------------------------------------------------------------

-- Add vector column (Drizzle doesn't support vector type natively)
ALTER TABLE embedding_chunks
ADD COLUMN IF NOT EXISTS embedding vector(1024);

-- Create HNSW index for fast approximate nearest neighbor search
-- HNSW provides better recall than IVFFlat for our expected data size
CREATE INDEX IF NOT EXISTS embedding_chunks_embedding_hnsw_idx
ON embedding_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
