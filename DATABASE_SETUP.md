# 💾 Database Setup Guide

## 📊 SQLite Database for Meme Storage

Your memes will be stored in: **`data/memes.db`**

You can open this file with **DB Browser for SQLite** or any SQLite client!

---

## 🚀 Quick Setup

### 1. Install better-sqlite3
```powershell
npm install better-sqlite3
```

### 2. Start Backend
```powershell
npm start
```

The database will be **automatically created** with all tables when the server starts!

**Location:** `data/memes.db`

---

## 📁 Files Created

```
memebot/
├── database/
│   └── schema.sql              ← Database schema (all tables)
├── backend/
│   └── services/
│       └── database.js         ← Database service
├── data/
│   └── memes.db               ← SQLite database (auto-created)
```

---

## 📋 Database Schema

### Main Tables

#### `memes` - Store all generated memes
```sql
id              INTEGER PRIMARY KEY
mode            TEXT (auto, layout, semiauto, manual)
idea            TEXT (original prompt)
image_data      TEXT (base64 image or URL)
spec_json       TEXT (complete meme specification)
tags            TEXT (comma-separated tags)
created_at      DATETIME
updated_at      DATETIME
```

#### `meme_versions` - Track edits (optional)
```sql
id              INTEGER PRIMARY KEY
meme_id         INTEGER (foreign key)
spec_json       TEXT
image_data      TEXT
version_number  INTEGER
created_at      DATETIME
```

#### `tags` - Manage tags
```sql
id              INTEGER PRIMARY KEY
name            TEXT UNIQUE
usage_count     INTEGER
created_at      DATETIME
```

#### `collections` - Organize memes (optional)
```sql
id              INTEGER PRIMARY KEY
name            TEXT
description     TEXT
created_at      DATETIME
```

### Views for Easy Queries

- `recent_memes` - Last 50 memes
- `memes_by_mode` - Count by mode and date
- `popular_tags` - Top 20 tags

---

## 🎯 How It Works

### Automatic Saving

When you generate a meme, it's **automatically saved** to the database!

```javascript
// Backend saves automatically after generation
memeId = database.saveMeme(mode, idea, imageUrl, memeSpec);
```

The response includes the database ID:
```json
{
  "success": true,
  "memeSpec": {...},
  "imageUrl": "...",
  "memeId": 123    ← Database ID
}
```

---

## 🔍 API Endpoints

### Get All Memes
```bash
GET http://localhost:5000/memes
GET http://localhost:5000/memes?limit=100&offset=0
```

### Get Single Meme
```bash
GET http://localhost:5000/memes/123
```

### Get Memes by Mode
```bash
GET http://localhost:5000/memes/mode/auto
GET http://localhost:5000/memes/mode/layout
```

### Search Memes
```bash
GET http://localhost:5000/search?q=monkey
GET http://localhost:5000/search?q=confused
```

### Get Statistics
```bash
GET http://localhost:5000/stats
```

**Returns:**
```json
{
  "total": 50,
  "auto_count": 20,
  "layout_count": 10,
  "semiauto_count": 15,
  "manual_count": 5,
  "first_meme": "2024-01-01",
  "last_meme": "2024-01-15"
}
```

### Get Recent Memes
```bash
GET http://localhost:5000/recent?days=7
```

### Delete Meme
```bash
DELETE http://localhost:5000/memes/123
```

---

## 🖥️ Opening with DB Browser

### Download DB Browser for SQLite
https://sqlitebrowser.org/dl/

### Open Your Database
1. Launch DB Browser
2. Click **"Open Database"**
3. Navigate to: `D:\Codes\memebot\data\memes.db`
4. View all tables, run queries, export data!

### Useful Queries

**View all memes:**
```sql
SELECT id, mode, idea, created_at FROM memes ORDER BY created_at DESC;
```

**Count by mode:**
```sql
SELECT mode, COUNT(*) as count FROM memes GROUP BY mode;
```

**Recent memes:**
```sql
SELECT * FROM memes WHERE created_at >= datetime('now', '-7 days');
```

**Search by idea:**
```sql
SELECT * FROM memes WHERE idea LIKE '%monkey%';
```

**Get meme with full spec:**
```sql
SELECT id, mode, idea, spec_json FROM memes WHERE id = 1;
```

---

## 📊 Frontend Integration (Optional)

Create a gallery page to view saved memes!

### Create `frontend/gallery.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Meme Gallery</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    .meme-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .meme-card img {
      width: 100%;
      border-radius: 6px;
    }
    .meme-info {
      margin-top: 10px;
    }
    .meme-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    .mode-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: white;
    }
    .mode-auto { background: #007bff; }
    .mode-layout { background: #6c757d; }
    .mode-semiauto { background: #28a745; }
    .mode-manual { background: #ffc107; color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 Meme Gallery</h1>
    
    <div style="margin: 20px 0;">
      <button onclick="loadGallery()">🔄 Refresh</button>
      <button onclick="loadByMode('auto')">Auto</button>
      <button onclick="loadByMode('layout')">Layout</button>
      <button onclick="loadByMode('semiauto')">Semi-Auto</button>
      <button onclick="loadByMode('manual')">Manual</button>
      <input type="text" id="searchInput" placeholder="Search..." style="margin-left: 10px;">
      <button onclick="search()">🔍 Search</button>
    </div>

    <div id="stats" style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 6px;"></div>
    
    <div class="gallery" id="gallery"></div>
  </div>

  <script>
    const API_URL = 'http://localhost:5000';

    async function loadGallery() {
      try {
        const res = await fetch(`${API_URL}/memes?limit=100`);
        const data = await res.json();
        displayMemes(data.memes);
        loadStats();
      } catch (err) {
        console.error('Error loading gallery:', err);
        alert('Failed to load gallery. Make sure backend is running.');
      }
    }

    async function loadByMode(mode) {
      try {
        const res = await fetch(`${API_URL}/memes/mode/${mode}`);
        const data = await res.json();
        displayMemes(data.memes);
      } catch (err) {
        console.error('Error loading memes:', err);
      }
    }

    async function search() {
      const query = document.getElementById('searchInput').value;
      if (!query) {
        loadGallery();
        return;
      }
      
      try {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        displayMemes(data.memes);
      } catch (err) {
        console.error('Error searching:', err);
      }
    }

    async function loadStats() {
      try {
        const res = await fetch(`${API_URL}/stats`);
        const data = await res.json();
        const stats = data.stats;
        
        document.getElementById('stats').innerHTML = `
          <strong>Statistics:</strong> 
          Total: ${stats.total} | 
          Auto: ${stats.auto_count} | 
          Layout: ${stats.layout_count} | 
          Semi-Auto: ${stats.semiauto_count} | 
          Manual: ${stats.manual_count}
        `;
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    }

    function displayMemes(memes) {
      const gallery = document.getElementById('gallery');
      
      if (memes.length === 0) {
        gallery.innerHTML = '<p>No memes found. Generate some first!</p>';
        return;
      }
      
      gallery.innerHTML = memes.map(meme => `
        <div class="meme-card">
          <img src="${meme.imageData}" alt="${meme.idea}" />
          <div class="meme-info">
            <span class="mode-badge mode-${meme.mode}">${meme.mode.toUpperCase()}</span>
            <p><strong>${meme.idea || 'No idea provided'}</strong></p>
            <p><small>${new Date(meme.createdAt).toLocaleString()}</small></p>
            ${meme.tags.length > 0 ? `<p><small>Tags: ${meme.tags.join(', ')}</small></p>` : ''}
            <button onclick="deleteMeme(${meme.id})">🗑️ Delete</button>
          </div>
        </div>
      `).join('');
    }

    async function deleteMeme(id) {
      if (!confirm('Delete this meme?')) return;
      
      try {
        await fetch(`${API_URL}/memes/${id}`, { method: 'DELETE' });
        loadGallery();
      } catch (err) {
        console.error('Error deleting meme:', err);
      }
    }

    // Load on page load
    loadGallery();
  </script>
</body>
</html>
```

---

## 🔧 Backup Database

### Programmatic Backup
```javascript
import database from './backend/services/database.js';

// Backup to specific file
database.backup('./backups/memes-backup.db');
```

### Manual Backup
Simply copy the file:
```powershell
Copy-Item data\memes.db backups\memes-backup-$(Get-Date -Format 'yyyy-MM-dd').db
```

---

## 🎯 Quick Test

### 1. Generate a Meme
```powershell
# Start backend
npm start

# Open frontend
start frontend\index.html

# Generate a meme (any mode)
```

### 2. Check Database
```powershell
# Backend logs will show:
# 💾 Meme saved with ID: 1
```

### 3. Open in DB Browser
```powershell
# Navigate to: data\memes.db
# View the 'memes' table
# You'll see your generated meme!
```

### 4. Query via API
```powershell
curl http://localhost:5000/memes
curl http://localhost:5000/stats
```

---

## ✅ Verification

After generating your first meme, check:

1. **File exists:** `data\memes.db` created
2. **Console log:** `💾 Meme saved with ID: 1`
3. **API works:** `curl http://localhost:5000/memes`
4. **DB Browser:** Open file and see data

---

## 🆘 Troubleshooting

### Database File Not Created
- Check `data/` directory exists
- Check console for errors
- Verify `database/schema.sql` exists

### Cannot Open in DB Browser
- Make sure backend is NOT running (closes connection)
- File might be locked
- Try copying the file first

### API Endpoints Not Working
- Backend must be running
- Check port 5000 is accessible
- Look for console errors

---

## 📚 Summary

**You now have:**
- ✅ SQLite database auto-created
- ✅ All tables defined in `schema.sql`
- ✅ Database service in `database.js`
- ✅ API endpoints for CRUD operations
- ✅ Automatic saving on meme generation
- ✅ Can open with DB Browser for SQLite

**Next steps:**
1. `npm install better-sqlite3`
2. `npm start`
3. Generate a meme
4. Open `data\memes.db` in DB Browser!

---

Enjoy your persistent meme storage! 🎨💾

