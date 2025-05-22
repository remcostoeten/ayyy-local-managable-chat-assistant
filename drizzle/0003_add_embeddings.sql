CREATE TABLE embeddings (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  embedding TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (article_id) REFERENCES knowledge_articles(id) ON DELETE CASCADE
); 