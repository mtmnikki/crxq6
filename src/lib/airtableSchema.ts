/**
 * Airtable schema resolver using the Metadata API.
 * - Fetches tables and fields for a base (by name) and caches to localStorage.
 * - Provides helpers to resolve Table IDs and Field IDs by known names.
 */

import { AIRTABLE_BASE_ID, getAirtableToken, TABLE_NAME_MAP, FIELD_NAME_MAP } from '../config/airtableConfig';

/** Types for Airtable Metadata API response */
interface MetaField {
  id: string;
  name: string;
  type: string;
}

interface MetaTable {
  id: string;
  name: string;
  fields: MetaField[];
}

interface MetaResponse {
  tables: MetaTable[];
}

const META_CACHE_KEY = 'AIRTABLE_META_CACHE_v1';
const META_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch Airtable metadata (tables + fields) using PAT.
 */
async function fetchMeta(): Promise<MetaResponse> {
  const token = getAirtableToken();
  if (!token) {
    throw new Error('Airtable PAT not found. Set it with localStorage.setItem("AIRTABLE_PAT", "your_pat").');
  }
  const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Airtable Metadata error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<MetaResponse>;
}

/**
 * Get metadata with localStorage caching.
 */
async function getMeta(): Promise<MetaResponse> {
  try {
    const raw = localStorage.getItem(META_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { at: number; data: MetaResponse };
      if (Date.now() - parsed.at < META_CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch {
    // ignore cache read errors
  }

  const data = await fetchMeta();
  try {
    localStorage.setItem(META_CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // ignore cache write errors
  }
  return data;
}

/**
 * Resolve a table ID by its name.
 */
export async function resolveTableIdByName(tableName: string): Promise<string> {
  const meta = await getMeta();
  const table = meta.tables.find((t) => t.name === tableName);
  if (!table) throw new Error(`Airtable table not found by name: ${tableName}`);
  return table.id;
}

/**
 * Resolve a field ID by table name and field name.
 */
export async function resolveFieldIdByNames(tableName: string, fieldName: string): Promise<string> {
  const meta = await getMeta();
  const table = meta.tables.find((t) => t.name === tableName);
  if (!table) throw new Error(`Airtable table not found by name: ${tableName}`);
  const field = table.fields.find((f) => f.name === fieldName);
  if (!field) throw new Error(`Airtable field not found: ${tableName}.${fieldName}`);
  return field.id;
}

/**
 * Resolve IDs by our internal keys (programs/resources).
 */
export async function resolveTableId(tableKey: keyof typeof TABLE_NAME_MAP): Promise<string> {
  const tableName = TABLE_NAME_MAP[tableKey];
  return resolveTableIdByName(tableName);
}

/**
 * Resolve a map of field IDs for a tableKey given field keys.
 */
export async function resolveFieldIds<T extends keyof typeof FIELD_NAME_MAP>(
  tableKey: T,
  fieldKeys: Array<keyof (typeof FIELD_NAME_MAP)[T]>
): Promise<Record<string, string>> {
  const tableName = TABLE_NAME_MAP[tableKey];
  const nameMap = FIELD_NAME_MAP[tableKey] as Record<string, string>;
  const result: Record<string, string> = {};
  for (const key of fieldKeys) {
    const fieldName = nameMap[String(key)];
    // resolve each to ID
    // eslint-disable-next-line no-await-in-loop
    result[String(key)] = await resolveFieldIdByNames(tableName, fieldName);
  }
  return result;
}
