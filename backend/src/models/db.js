const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database/counseling.db';
const dbPath = path.resolve(process.cwd(), DB_PATH);

let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

module.exports = { getDb };
