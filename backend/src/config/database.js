import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import config from './env.js';

mkdirSync(path.dirname(config.SQLITE_PATH), { recursive: true });

export const db = new DatabaseSync(config.SQLITE_PATH);

// Tối ưu hiệu năng và toàn vẹn dữ liệu
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS patients (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    code          TEXT NOT NULL UNIQUE,
    full_name     TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender        TEXT NOT NULL,
    phone         TEXT NOT NULL,
    stage         TEXT NOT NULL,
    status        TEXT NOT NULL CHECK (status IN ('stable', 'watch', 'critical')),
    egfr          REAL NOT NULL,
    egfr_trend    TEXT NOT NULL DEFAULT 'stable',
    next_dialysis TEXT,
    doctor        TEXT NOT NULL,
    updated_at    TEXT NOT NULL,
    address       TEXT NOT NULL DEFAULT '',
    diagnosis     TEXT NOT NULL DEFAULT '',
    allergies     TEXT NOT NULL DEFAULT '',
    medications   TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS labs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id  INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recorded_at TEXT NOT NULL,
    creatinine  REAL NOT NULL,
    egfr        REAL NOT NULL,
    urea        REAL NOT NULL,
    potassium   REAL NOT NULL,
    hemoglobin  REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dialysis_sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    scheduled_at TEXT NOT NULL,
    duration     INTEGER NOT NULL,
    station      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    severity   TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
    title      TEXT NOT NULL,
    detail     TEXT NOT NULL,
    created_at TEXT NOT NULL,
    read       INTEGER NOT NULL DEFAULT 0
  );
`);

console.log(`[DB] SQLite initialized via node:sqlite at ${config.SQLITE_PATH}`);

export default db;

