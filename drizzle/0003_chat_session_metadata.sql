CREATE TABLE chat_session_metadata (
  session_id TEXT PRIMARY KEY NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  last_accessed_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
); 