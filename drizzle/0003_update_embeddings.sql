-- Update embeddings table to use snake_case column names
ALTER TABLE embeddings RENAME COLUMN articleId TO article_id;
ALTER TABLE embeddings RENAME COLUMN chunkText TO chunk_text;
ALTER TABLE embeddings RENAME COLUMN chunkIndex TO chunk_index; 