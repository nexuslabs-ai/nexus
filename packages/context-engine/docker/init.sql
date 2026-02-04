-- =============================================================================
-- PostgreSQL Initialization Script
-- Runs automatically when the container is first created
-- =============================================================================

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;
