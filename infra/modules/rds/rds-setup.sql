CREATE EXTENSION IF NOT EXISTS vector;
CREATE SCHEMA bedrock_integration;
CREATE ROLE DB_USER WITH LOGIN PASSWORD 'DB_PASSWORD';
GRANT ALL ON SCHEMA bedrock_integration to DB_USER;
SET SESSION AUTHORIZATION bedrock_user;
CREATE TABLE bedrock_integration.bedrock_kb (
  id uuid PRIMARY KEY,
  embedding vector(1536),
  chunks text,
  metadata json
);
CREATE INDEX ON bedrock_integration.bedrock_kb
  USING hnsw (embedding vector_cosine_ops);
  