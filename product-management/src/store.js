import initSqlJs from "sql.js";
import fs from "fs";

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

const dbPath = "./data/store.db";
let db = null;

async function initDb() {
  if (db) return db;
  
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      content TEXT,
      status TEXT,
      createdAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

await initDb();

/* CRUD */

export function saveDraft(id, content) {
  const stmt = db.prepare(`
    INSERT INTO drafts (id, content, status, createdAt)
    VALUES (?, ?, 'DRAFT', ?)
  `);
  stmt.bind([id, content, new Date().toISOString()]);
  stmt.step();
  stmt.free();
  saveDb();
}

export function listDrafts() {
  const stmt = db.prepare(`
    SELECT * FROM drafts ORDER BY createdAt DESC
  `);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}

export function getDraft(id) {
  const stmt = db.prepare(`
    SELECT * FROM drafts WHERE id = ?
  `);
  stmt.bind([id]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

export function updateDraft(id, content) {
  const stmt = db.prepare(`
    UPDATE drafts 
    SET content = ?, status = 'REVIEW' 
    WHERE id = ?
  `);
  stmt.bind([content, id]);
  stmt.step();
  stmt.free();
  saveDb();
}

export function updateStatus(id, status) {
  const stmt = db.prepare(`
    UPDATE drafts SET status = ? WHERE id = ?
  `);
  stmt.bind([status, id]);
  stmt.step();
  stmt.free();
  saveDb();
}

export function deleteDraft(id) {
  const stmt = db.prepare(`
    DELETE FROM drafts WHERE id = ?
  `);
  stmt.bind([id]);
  stmt.step();
  stmt.free();
  saveDb();
}

/* ACTIVE */

export function setActive(id) {
  const stmt = db.prepare(`
    INSERT INTO meta (key, value)
    VALUES ('active', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.bind([id]);
  stmt.step();
  stmt.free();
  saveDb();
}

export function getActive() {
  const stmt = db.prepare(`
    SELECT value FROM meta WHERE key = 'active'
  `);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result?.value || null;
}
