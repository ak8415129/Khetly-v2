-- Enable pgvector extension (Supabase: Database → Extensions → enable "vector", or run this directly)
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base chunks for the RAG assistant.
-- embedding uses 384 dimensions to match the local all-MiniLM-L6-v2 model (@xenova/transformers).
CREATE TABLE IF NOT EXISTS "knowledge_chunks" (
  "id"         TEXT PRIMARY KEY,
  "title"      TEXT NOT NULL,
  "content"    TEXT NOT NULL,
  "category"   TEXT NOT NULL DEFAULT 'general',
  "embedding"  vector(384),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL
);

-- IVFFlat index for fast approximate cosine-similarity search.
-- Safe to create even with zero/few rows — Prisma's seed script populates this table after migration.
CREATE INDEX IF NOT EXISTS "knowledge_chunks_embedding_idx"
  ON "knowledge_chunks"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);
