-- Meme Generator Database Schema
-- SQLite Database for storing generated memes
-- Can be opened directly with DB Browser for SQLite or any SQLite client

-- Main memes table
CREATE TABLE IF NOT EXISTS memes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode TEXT NOT NULL,                    -- 'auto', 'layout', 'semiauto', 'manual'
  idea TEXT,                             -- Original meme idea/prompt
  image_data TEXT,                       -- Base64 image data or URL
  spec_json TEXT NOT NULL,               -- Complete meme specification (JSON)
  tags TEXT,                             -- Comma-separated tags for searching
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memes_mode ON memes(mode);
CREATE INDEX IF NOT EXISTS idx_memes_tags ON memes(tags);

-- Meme history/versions (optional - track edits)
CREATE TABLE IF NOT EXISTS meme_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meme_id INTEGER NOT NULL,
  spec_json TEXT NOT NULL,
  image_data TEXT,
  version_number INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meme_id) REFERENCES memes(id) ON DELETE CASCADE
);

-- Tags table (for better tag management)
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Meme-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS meme_tags (
  meme_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (meme_id, tag_id),
  FOREIGN KEY (meme_id) REFERENCES memes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- User favorites (optional)
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meme_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meme_id) REFERENCES memes(id) ON DELETE CASCADE
);

-- Collections/Albums (optional - organize memes)
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_memes (
  collection_id INTEGER NOT NULL,
  meme_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, meme_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (meme_id) REFERENCES memes(id) ON DELETE CASCADE
);

-- Statistics table (optional - track generation stats)
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date DATE NOT NULL UNIQUE,
  total_generated INTEGER DEFAULT 0,
  auto_mode INTEGER DEFAULT 0,
  layout_mode INTEGER DEFAULT 0,
  semiauto_mode INTEGER DEFAULT 0,
  manual_mode INTEGER DEFAULT 0
);

-- Trigger to update updated_at on memes table
CREATE TRIGGER IF NOT EXISTS update_meme_timestamp 
AFTER UPDATE ON memes
BEGIN
  UPDATE memes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Views for easier queries

-- Recent memes view
CREATE VIEW IF NOT EXISTS recent_memes AS
SELECT 
  id,
  mode,
  idea,
  tags,
  created_at,
  LENGTH(image_data) as image_size
FROM memes
ORDER BY created_at DESC
LIMIT 50;

-- Memes by mode view
CREATE VIEW IF NOT EXISTS memes_by_mode AS
SELECT 
  mode,
  COUNT(*) as count,
  DATE(created_at) as date
FROM memes
GROUP BY mode, DATE(created_at)
ORDER BY date DESC;

-- Popular tags view
CREATE VIEW IF NOT EXISTS popular_tags AS
SELECT 
  name,
  usage_count
FROM tags
ORDER BY usage_count DESC
LIMIT 20;

-- Sample data (optional - remove if not needed)
-- INSERT INTO tags (name) VALUES ('funny'), ('relatable'), ('work'), ('cat'), ('dog'), ('programmer'), ('wholesome'), ('dank');

