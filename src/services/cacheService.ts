import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { CACHE_EXPIRY_MS } from '../constants/config';
import type { CacheEntry } from '../types/weather';

const IS_WEB = Platform.OS === 'web';

let _db: SQLite.SQLiteDatabase | null = null;
let _initPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;

export async function initDB(): Promise<SQLite.SQLiteDatabase | null> {
  if (IS_WEB) return null;
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
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
    } catch (e) {
      console.warn('[Cache] SQLite init failed, falling back to null:', e);
      return null;
    }
  })();

  return _initPromise;
}

async function getDB(): Promise<SQLite.SQLiteDatabase | null> {
  return _db ?? (await initDB());
}

const webStore = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch { return null; }
  },
  set: (key: string, val: string) => {
    try {
      localStorage.setItem(key, val);
    } catch {}
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

export async function saveCache<T>(key: string, data: T): Promise<void> {
  const timestamp = Date.now();
  const serialized = JSON.stringify(data);

  if (IS_WEB) {
    webStore.set(`cache_${key}`, JSON.stringify({ data, timestamp }));
    return;
  }

  try {
    const db = await getDB();
    if (!db) throw new Error('DB not available');
    await db.runAsync(
      `INSERT INTO weather_cache (key, data, timestamp) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET data = excluded.data, timestamp = excluded.timestamp;`,
      [key, serialized, timestamp],
    );
  } catch (e: any) {
    console.warn('[Cache] saveCache failed:', e.message);
  }
}

  export async function loadCache<T>(
  key: string,
  allowExpired = false,
): Promise<CacheEntry<T> | null> {
  if (IS_WEB) {
    const raw = webStore.get(`cache_${key}`);
    if (!raw) return null;
    try {
      const { data, timestamp } = JSON.parse(raw);
      const age = Date.now() - timestamp;
      const isExpired = age > CACHE_EXPIRY_MS;
      if (!allowExpired && isExpired) return null;
      return { data: data as T, age, isExpired };
    } catch { return null; }
  }

  try {
    const db = await getDB();
    if (!db) return null;
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

export async function clearCache(key: string): Promise<void> {
  if (IS_WEB) {
    webStore.remove(`cache_${key}`);
    return;
  }

  try {
    const db = await getDB();
    if (db) await db.runAsync('DELETE FROM weather_cache WHERE key = ?;', [key]);
  } catch (e: any) {
    console.warn('[Cache] clearCache failed:', e.message);
  }
}

export async function pruneExpiredCache(): Promise<void> {
  if (IS_WEB) return;

  try {
    const db = await getDB();
    if (!db) return;
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

export async function saveLastCity(city: string): Promise<void> {
  if (IS_WEB) {
    webStore.set('last_city', city);
    return;
  }

  try {
    const db = await getDB();
    if (!db) return;
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
  if (IS_WEB) {
    return webStore.get('last_city');
  }

  try {
    const db = await getDB();
    if (!db) return null;
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'last_city';",
    );
    return row?.value ?? null;
  } catch (e: any) {
    console.warn('[Cache] loadLastCity failed:', e.message);
    return null;
  }
}
