# 💾 Database Recommendations for Meme Storage

## 🎯 Your Use Case: Local Development

Since you want to **run locally** and store memes, here are the best options:

---

## ⭐ Recommended: SQLite (Best for Local!)

### Why SQLite?
- ✅ **Zero configuration** - Single file database
- ✅ **No server needed** - Runs in the same process
- ✅ **Perfect for local** - Designed for single-user apps
- ✅ **Lightweight** - Only ~600KB
- ✅ **Built-in Node.js support** - `better-sqlite3` package
- ✅ **Fast** - Excellent for local queries
- ✅ **Portable** - Just one `.db` file

### Installation
```bash
npm install better-sqlite3
```

### Database Schema
```sql
CREATE TABLE memes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode TEXT NOT NULL,
  idea TEXT,
  image_url TEXT,
  spec_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  tags TEXT
);

CREATE TABLE meme_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meme_id INTEGER,
  action TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meme_id) REFERENCES memes(id)
);
```

### Example Implementation

**Create database service:**

```javascript
// backend/services/database.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/memes.db');

class MemeDatabase {
  constructor() {
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL,
        idea TEXT,
        image_data TEXT,
        spec_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_created_at ON memes(created_at);
      CREATE INDEX IF NOT EXISTS idx_mode ON memes(mode);
    `);
  }

  saveMeme(mode, idea, imageUrl, memeSpec, tags = []) {
    const stmt = this.db.prepare(`
      INSERT INTO memes (mode, idea, image_data, spec_json, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      mode,
      idea,
      imageUrl,
      JSON.stringify(memeSpec),
      JSON.stringify(tags)
    );

    return result.lastInsertRowid;
  }

  getMeme(id) {
    const stmt = this.db.prepare('SELECT * FROM memes WHERE id = ?');
    const row = stmt.get(id);
    
    if (row) {
      row.spec_json = JSON.parse(row.spec_json);
      row.tags = JSON.parse(row.tags || '[]');
    }
    
    return row;
  }

  getAllMemes(limit = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM memes 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    return stmt.all(limit).map(row => ({
      ...row,
      spec_json: JSON.parse(row.spec_json),
      tags: JSON.parse(row.tags || '[]')
    }));
  }

  searchMemes(query) {
    const stmt = this.db.prepare(`
      SELECT * FROM memes 
      WHERE idea LIKE ? OR tags LIKE ?
      ORDER BY created_at DESC
    `);
    
    return stmt.all(`%${query}%`, `%${query}%`).map(row => ({
      ...row,
      spec_json: JSON.parse(row.spec_json),
      tags: JSON.parse(row.tags || '[]')
    }));
  }

  deleteMeme(id) {
    const stmt = this.db.prepare('DELETE FROM memes WHERE id = ?');
    return stmt.run(id);
  }
}

export default new MemeDatabase();
```

**Add endpoints to server.js:**

```javascript
import database from './services/database.js';

// Save meme
app.post('/save', async (req, res) => {
  try {
    const { mode, idea, imageUrl, memeSpec, tags } = req.body;
    const id = database.saveMeme(mode, idea, imageUrl, memeSpec, tags);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all memes
app.get('/memes', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const memes = database.getAllMemes(limit);
    res.json({ success: true, memes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single meme
app.get('/memes/:id', (req, res) => {
  try {
    const meme = database.getMeme(req.params.id);
    if (meme) {
      res.json({ success: true, meme });
    } else {
      res.status(404).json({ error: 'Meme not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete meme
app.delete('/memes/:id', (req, res) => {
  try {
    database.deleteMeme(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search memes
app.get('/search', (req, res) => {
  try {
    const query = req.query.q;
    const memes = database.searchMemes(query);
    res.json({ success: true, memes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## 🗂️ Alternative 1: File System Storage (Simplest!)

If you don't need complex queries, just save files:

### Pros
- ✅ **No dependencies** - Use built-in `fs` module
- ✅ **Simple** - Just write JSON files
- ✅ **Easy to backup** - Copy folder
- ✅ **Human-readable** - Open files directly

### Implementation

```javascript
// backend/services/fileStorage.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = path.join(__dirname, '../../data/memes');

class FileStorage {
  async init() {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }

  async saveMeme(memeData) {
    const id = Date.now();
    const filename = `meme-${id}.json`;
    const filepath = path.join(STORAGE_DIR, filename);
    
    const data = {
      id,
      ...memeData,
      savedAt: new Date().toISOString()
    };
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    
    // Save image separately
    if (memeData.imageUrl && memeData.imageUrl.startsWith('data:')) {
      const imageData = memeData.imageUrl.split(',')[1];
      const imageBuffer = Buffer.from(imageData, 'base64');
      await fs.writeFile(
        path.join(STORAGE_DIR, `meme-${id}.png`),
        imageBuffer
      );
    }
    
    return id;
  }

  async getMeme(id) {
    const filepath = path.join(STORAGE_DIR, `meme-${id}.json`);
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  }

  async getAllMemes() {
    const files = await fs.readdir(STORAGE_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const memes = await Promise.all(
      jsonFiles.map(async (file) => {
        const data = await fs.readFile(
          path.join(STORAGE_DIR, file),
          'utf-8'
        );
        return JSON.parse(data);
      })
    );
    
    return memes.sort((a, b) => b.id - a.id);
  }

  async deleteMeme(id) {
    await fs.unlink(path.join(STORAGE_DIR, `meme-${id}.json`));
    try {
      await fs.unlink(path.join(STORAGE_DIR, `meme-${id}.png`));
    } catch (err) {
      // Image might not exist
    }
  }
}

export default new FileStorage();
```

---

## 🔄 Alternative 2: LowDB (JSON Database)

Simple JSON-based database with queries:

```bash
npm install lowdb
```

```javascript
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const adapter = new JSONFile('data/db.json');
const db = new Low(adapter);

await db.read();
db.data ||= { memes: [] };

// Add meme
db.data.memes.push({
  id: Date.now(),
  mode: 'auto',
  idea: 'monkey meme',
  imageUrl: '...',
  createdAt: new Date().toISOString()
});

await db.write();

// Query
const recentMemes = db.data.memes.slice(-10);
```

---

## 📊 Comparison Table

| Feature | SQLite | File System | LowDB |
|---------|--------|-------------|-------|
| Setup Complexity | Low | Very Low | Low |
| Query Performance | Excellent | Poor | Good |
| Storage Size | Small | Medium | Medium |
| Human Readable | No | Yes | Yes |
| Scalability | Good | Poor | Fair |
| Dependencies | 1 | 0 | 1 |
| **Best For** | **Local app with queries** | **Quick prototypes** | **JSON-based apps** |

---

## 🎯 My Recommendation: SQLite

For your use case, I recommend **SQLite with better-sqlite3** because:

1. ✅ **Perfect for local development**
2. ✅ **Fast queries** (filter by date, mode, tags)
3. ✅ **Easy to implement** (see code above)
4. ✅ **Can grow with you** (if you want to add features later)
5. ✅ **Single file** - easy to backup/move

---

## 🚀 Quick Setup with SQLite

### 1. Install
```bash
npm install better-sqlite3
```

### 2. Create directory
```bash
mkdir -p data
```

### 3. Copy database service
Use the `backend/services/database.js` code above

### 4. Add to server.js
```javascript
import database from './services/database.js';

// After generating meme, save it:
const memeId = database.saveMeme(mode, idea, imageUrl, memeSpec);
console.log(`💾 Meme saved with ID: ${memeId}`);
```

### 5. Add gallery endpoint
```javascript
app.get('/gallery', (req, res) => {
  const memes = database.getAllMemes(100);
  res.json({ memes });
});
```

---

## 📁 Project Structure with Database

```
memebot/
├── backend/
│   ├── server.js
│   └── services/
│       ├── database.js          ← NEW!
│       ├── memeOrchestrator.js
│       └── ...
├── data/
│   └── memes.db                 ← SQLite database file
├── frontend/
│   ├── index.html
│   ├── gallery.html             ← NEW! Show saved memes
│   └── ...
└── package.json
```

---

## 🎨 Bonus: Gallery UI

Create `frontend/gallery.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Meme Gallery</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>📸 Meme Gallery</h1>
    <div id="gallery"></div>
  </div>

  <script>
    async function loadGallery() {
      const res = await fetch('http://localhost:5000/gallery');
      const data = await res.json();
      
      const gallery = document.getElementById('gallery');
      gallery.innerHTML = data.memes.map(meme => `
        <div class="meme-card">
          <img src="${meme.image_data}" />
          <p>${meme.idea}</p>
          <small>${new Date(meme.created_at).toLocaleDateString()}</small>
        </div>
      `).join('');
    }
    
    loadGallery();
  </script>
</body>
</html>
```

---

## ✅ Summary

**For local development:**
- **Use SQLite** if you want features (search, filter, tags)
- **Use File System** if you just want to save/load
- **Use LowDB** if you love JSON

**My recommendation: Start with SQLite** - it's the best balance of simplicity and power!

Would you like me to implement the SQLite storage for you?

