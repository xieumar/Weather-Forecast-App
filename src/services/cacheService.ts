import * as SQLite from 'expo-sqlite';
import { CACHE_EXPIRY_MS } from '../constants/config';
import type { CacheEntry } from '../types/weather';

// ── Singleton ─────────────────────────────────────────────────────────────────
let _db: SQLite.SQLiteDatabase | null = null;
let _initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function initDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const db = await SQLite.openDatabaseAsync('weather_app.db');
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        key       TEXT    PRIMARY KEY NOT NULL,
        data      TEXT    NOT NULL,
        timestamp INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_meta (
        key   TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    _db = db;
    return db;
  })();

  return _initPromise;
}

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  return _db ?? (await initDB());
}

// ── Write ─────────────────────────────────────────────────────────────────────
export async function saveCache<T>(key: string, data: T): Promise<void> {
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT INTO weather_cache (key, data, timestamp) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET data = excluded.data, timestamp = excluded.timestamp;`,
      [key, JSON.stringify(data), Date.now()],
    );
  } catch (e: any) {
    console.warn('[Cache] saveCache failed:', e.message);
  }
}

// ── Read ──────────────────────────────────────────────────────────────────────
export async function loadCache<T>(
  key: string,
  allowExpired = false,
): Promise<CacheEntry<T> | null> {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<{ data: string; timestamp: number }>(
      'SELECT data, timestamp FROM weather_cache WHERE key = ?;',
      [key],
    );
    if (!row) return null;

    const age = Date.now() - row.timestamp;
    const isExpired = age > CACHE_EXPIRY_MS;
    if (!allowExpired && isExpired) return null;

    return { data: JSON.parse(row.data) as T, age, isExpired };
  } catch (e: any) {
    console.warn('[Cache] loadCache failed:', e.message);
    return null;
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function clearCache(key: string): Promise<void> {
  try {
    const db = await getDB();
    await db.runAsync('DELETE FROM weather_cache WHERE key = ?;', [key]);
  } catch (e: any) {
    console.warn('[Cache] clearCache failed:', e.message);
  }
}

export async function pruneExpiredCache(): Promise<void> {
  try {
    const db = await getDB();
    const cutoff = Date.now() - CACHE_EXPIRY_MS;
    const result = await db.runAsync(
      'DELETE FROM weather_cache WHERE timestamp < ?;',
      [cutoff],
    );
    if (result.changes > 0) console.log(`[Cache] Pruned ${result.changes} row(s).`);
  } catch (e: any) {
    console.warn('[Cache] pruneExpiredCache failed:', e.message);
  }
}

// ── App meta ──────────────────────────────────────────────────────────────────
export async function saveLastCity(city: string): Promise<void> {
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT INTO app_meta (key, value) VALUES ('last_city', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
      [city],
    );
  } catch (e: any) {
    console.warn('[Cache] saveLastCity failed:', e.message);
  }
}

export async function loadLastCity(): Promise<string | null> {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'last_city';",
    );
    return row?.value ?? null;
  } catch (e: any) {
    console.warn('[Cache] loadLastCity failed:', e.message);
    return null;
  }
}