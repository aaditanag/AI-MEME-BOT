/**
 * Database Service for Meme Storage
 * Uses sql.js (SQLite compiled to WebAssembly - NO native dependencies!)
 * Database file: data/memes.db (can be opened with DB Browser for SQLite)
 */

import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'memes.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema.sql');

class MemeDatabase {
  constructor() {
    this.db = null;
    this.ready = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Initialize sql.js
      const SQL = await initSqlJs();

      // Load existing database or create new
      if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        this.db = new SQL.Database(buffer);
        console.log(`📊 Database loaded: ${DB_PATH}`);
      } else {
        this.db = new SQL.Database();
        console.log(`📊 New database created: ${DB_PATH}`);
      }

      // Initialize schema
      this.initializeSchema();
      
      // Save initial state
      this.save();
      
      this.ready = true;
      console.log('✅ Database ready!');
    } catch (err) {
      console.error('❌ Database initialization failed:', err.message);
      throw err;
    }
  }

  async ensureReady() {
    if (!this.ready) {
      await this.initPromise;
    }
  }

  /**
   * Initialize database schema from SQL file
   */
  initializeSchema() {
    try {
      if (fs.existsSync(SCHEMA_PATH)) {
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        this.db.run(schema);
        console.log('✅ Database schema initialized');
      } else {
        console.warn('⚠️  Schema file not found, using minimal schema');
        this.createMinimalSchema();
      }
    } catch (err) {
      console.error('❌ Error initializing schema:', err.message);
      this.createMinimalSchema();
    }
  }

  /**
   * Create minimal schema if SQL file not found
   */
  createMinimalSchema() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS memes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL,
        idea TEXT,
        image_data TEXT,
        spec_json TEXT NOT NULL,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_memes_mode ON memes(mode);
    `);
  }

  /**
   * Save database to file
   */
  save() {
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_PATH, buffer);
    } catch (err) {
      console.error('❌ Error saving database:', err.message);
    }
  }

  /**
   * Save a new meme
   */
  async saveMeme(mode, idea, imageData, memeSpec, tags = []) {
    await this.ensureReady();
    
    try {
      this.db.run(
        `INSERT INTO memes (mode, idea, image_data, spec_json, tags)
         VALUES (?, ?, ?, ?, ?)`,
        [mode, idea || '', imageData || '', JSON.stringify(memeSpec), tags.join(',')]
      );

      // Get last insert ID
      const result = this.db.exec('SELECT last_insert_rowid() as id');
      const id = result[0].values[0][0];

      // Save to file
      this.save();

      console.log(`💾 Meme saved with ID: ${id}`);
      return id;
    } catch (err) {
      console.error('❌ Error saving meme:', err.message);
      throw err;
    }
  }

  /**
   * Get a single meme by ID
   */
  async getMeme(id) {
    await this.ensureReady();
    
    try {
      const result = this.db.exec('SELECT * FROM memes WHERE id = ?', [id]);
      
      if (result.length > 0 && result[0].values.length > 0) {
        return this.formatMemeFromArray(result[0].columns, result[0].values[0]);
      }
      return null;
    } catch (err) {
      console.error('❌ Error getting meme:', err.message);
      throw err;
    }
  }

  /**
   * Get all memes with pagination
   */
  async getAllMemes(limit = 50, offset = 0) {
    await this.ensureReady();
    
    try {
      const result = this.db.exec(
        `SELECT * FROM memes ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      if (result.length > 0) {
        return result[0].values.map(row => 
          this.formatMemeFromArray(result[0].columns, row)
        );
      }
      return [];
    } catch (err) {
      console.error('❌ Error getting memes:', err.message);
      throw err;
    }
  }

  /**
   * Get memes by mode
   */
  async getMemesByMode(mode, limit = 50) {
    await this.ensureReady();
    
    try {
      const result = this.db.exec(
        `SELECT * FROM memes WHERE mode = ? ORDER BY created_at DESC LIMIT ?`,
        [mode, limit]
      );

      if (result.length > 0) {
        return result[0].values.map(row => 
          this.formatMemeFromArray(result[0].columns, row)
        );
      }
      return [];
    } catch (err) {
      console.error('❌ Error getting memes by mode:', err.message);
      throw err;
    }
  }

  /**
   * Search memes by idea or tags
   */
  async searchMemes(query, limit = 50) {
    await this.ensureReady();
    
    try {
      const searchTerm = `%${query}%`;
      const result = this.db.exec(
        `SELECT * FROM memes WHERE idea LIKE ? OR tags LIKE ? ORDER BY created_at DESC LIMIT ?`,
        [searchTerm, searchTerm, limit]
      );

      if (result.length > 0) {
        return result[0].values.map(row => 
          this.formatMemeFromArray(result[0].columns, row)
        );
      }
      return [];
    } catch (err) {
      console.error('❌ Error searching memes:', err.message);
      throw err;
    }
  }

  /**
   * Update a meme
   */
  async updateMeme(id, updates) {
    await this.ensureReady();
    
    try {
      const fields = [];
      const values = [];

      if (updates.idea !== undefined) {
        fields.push('idea = ?');
        values.push(updates.idea);
      }
      if (updates.imageData !== undefined) {
        fields.push('image_data = ?');
        values.push(updates.imageData);
      }
      if (updates.memeSpec !== undefined) {
        fields.push('spec_json = ?');
        values.push(JSON.stringify(updates.memeSpec));
      }
      if (updates.tags !== undefined) {
        fields.push('tags = ?');
        values.push(Array.isArray(updates.tags) ? updates.tags.join(',') : updates.tags);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);

      this.db.run(
        `UPDATE memes SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      this.save();
      console.log(`✏️  Meme ${id} updated`);
      return true;
    } catch (err) {
      console.error('❌ Error updating meme:', err.message);
      throw err;
    }
  }

  /**
   * Delete a meme
   */
  async deleteMeme(id) {
    await this.ensureReady();
    
    try {
      this.db.run('DELETE FROM memes WHERE id = ?', [id]);
      this.save();
      console.log(`🗑️  Meme ${id} deleted`);
      return true;
    } catch (err) {
      console.error('❌ Error deleting meme:', err.message);
      throw err;
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    await this.ensureReady();
    
    try {
      const result = this.db.exec(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN mode = 'auto' THEN 1 ELSE 0 END) as auto_count,
          SUM(CASE WHEN mode = 'layout' THEN 1 ELSE 0 END) as layout_count,
          SUM(CASE WHEN mode = 'semiauto' THEN 1 ELSE 0 END) as semiauto_count,
          SUM(CASE WHEN mode = 'manual' THEN 1 ELSE 0 END) as manual_count,
          DATE(MIN(created_at)) as first_meme,
          DATE(MAX(created_at)) as last_meme
        FROM memes
      `);

      if (result.length > 0 && result[0].values.length > 0) {
        const cols = result[0].columns;
        const vals = result[0].values[0];
        const stats = {};
        cols.forEach((col, i) => {
          stats[col] = vals[i];
        });
        return stats;
      }
      return {};
    } catch (err) {
      console.error('❌ Error getting stats:', err.message);
      throw err;
    }
  }

  /**
   * Get recent memes (last 7 days)
   */
  async getRecentMemes(days = 7) {
    await this.ensureReady();
    
    try {
      const result = this.db.exec(`
        SELECT * FROM memes
        WHERE created_at >= datetime('now', '-${days} days')
        ORDER BY created_at DESC
      `);

      if (result.length > 0) {
        return result[0].values.map(row => 
          this.formatMemeFromArray(result[0].columns, row)
        );
      }
      return [];
    } catch (err) {
      console.error('❌ Error getting recent memes:', err.message);
      throw err;
    }
  }

  /**
   * Format meme from array (sql.js returns arrays)
   */
  formatMemeFromArray(columns, values) {
    const row = {};
    columns.forEach((col, i) => {
      row[col] = values[i];
    });

    return {
      id: row.id,
      mode: row.mode,
      idea: row.idea,
      imageData: row.image_data,
      memeSpec: JSON.parse(row.spec_json),
      tags: row.tags ? row.tags.split(',').filter(t => t) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.save();
      this.db.close();
      console.log('📊 Database connection closed');
    }
  }

  /**
   * Backup database
   */
  backup(backupPath) {
    try {
      fs.copyFileSync(DB_PATH, backupPath);
      console.log(`💾 Database backed up to: ${backupPath}`);
      return true;
    } catch (err) {
      console.error('❌ Error backing up database:', err.message);
      throw err;
    }
  }
}

// Export singleton instance
export default new MemeDatabase();

