-- Add recommendation-related columns to articles
ALTER TABLE articles ADD COLUMN average_rating REAL DEFAULT 0;
ALTER TABLE articles ADD COLUMN rating_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN topic_vector TEXT;
ALTER TABLE articles ADD COLUMN cluster_id INTEGER;

-- Create user_ratings table
CREATE TABLE user_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  article_id INTEGER NOT NULL,
  rating REAL NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Add indexes for performance
CREATE INDEX idx_article_cluster ON articles(cluster_id);
CREATE INDEX idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX idx_user_ratings_article ON user_ratings(article_id);
CREATE INDEX idx_user_ratings_compound ON user_ratings(user_id, article_id); 