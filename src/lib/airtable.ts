/**
 * Minimal Airtable REST client using table and field names.
 * - Uses the AIRTABLE_API_KEY environment variable for authentication.
 * - Works with the new base appuo6esxsc55yCgI.
 */

import { AIRTABLE_BASE_ID, getAirtableToken } from '../config/airtableConfig';

export interface AirtableRecord<TFields = Record<string, unknown>> {
  id: string;
  createdTime: string;
  fields: TFields;
}

interface ListResponse<TFields> {
  records: AirtableRecord<TFields>[];
  offset?: string;
}

function buildTableUrl(table: string, params?: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.append(k, String(v));
    });
  }
  const query = sp.toString();
  return `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}${query ? `?${query}` : ''}`;
}

function buildRecordUrl(table: string, recordId: string, params?: Record<string, string | number | boolean | undefined>) {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.append(k, String(v));
    });
  }
  const query = sp.toString();
  return `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${recordId}${query ? `?${query}` : ''}`;
}

async function airtableFetch<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const token = getAirtableToken();
  if (!token) {
    throw new Error('Airtable API key not configured');
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Airtable error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listRecords<TFields = Record<string, unknown>>(opts: {
  table: string;
  pageSize?: number;
  offset?: string;
  filterByFormula?: string;
  fields?: string[];
  view?: string;
  sort?: { field: string; direction?: 'asc' | 'desc' }[];
}): Promise<ListResponse<TFields>> {
  const params: Record<string, string> = {};
  if (opts.pageSize) params['pageSize'] = String(opts.pageSize);
  if (opts.offset) params['offset'] = String(opts.offset);
  if (opts.filterByFormula) params['filterByFormula'] = opts.filterByFormula;
  if (opts.view) params['view'] = opts.view;
  if (opts.sort && opts.sort.length) {
    opts.sort.forEach((s, i) => {
      params[`sort[${i}][field]`] = s.field;
      if (s.direction) params[`sort[${i}][direction]`] = s.direction;
    });
  }

  let url = buildTableUrl(opts.table, params);
  if (opts.fields?.length) {
    const append = opts.fields.map((f) => `fields[]=${encodeURIComponent(f)}`).join('&');
    url = `${url}${url.includes('?') ? '&' : '?'}${append}`;
  }
  return airtableFetch<ListResponse<TFields>>(url);
}

export async function getRecord<TFields = Record<string, unknown>>(opts: {
  table: string;
  recordId: string;
  fields?: string[];
}): Promise<AirtableRecord<TFields>> {
  let url = buildRecordUrl(opts.table, opts.recordId);
  if (opts.fields?.length) {
    const append = opts.fields.map((f) => `fields[]=${encodeURIComponent(f)}`).join('&');
    url = `${url}${url.includes('?') ? '&' : '?'}${append}`;
  }
  return airtableFetch<AirtableRecord<TFields>>(url);
}

export async function listAllRecords<TFields = Record<string, unknown>>(opts: {
  table: string;
  pageSize?: number;
  maxRecords?: number;
  filterByFormula?: string;
  fields?: string[];
  view?: string;
  sort?: { field: string; direction?: 'asc' | 'desc' }[];
}): Promise<AirtableRecord<TFields>[]> {
  const pageSize = Math.min(Math.max(opts.pageSize || 100, 1), 100);
  let offset: string | undefined = undefined;
  const out: AirtableRecord<TFields>[] = [];

  // eslint-disable-next-line no-constant-condition
    while (true) {
      const res: ListResponse<TFields> = await listRecords<TFields>({
        table: opts.table,
        pageSize,
        offset,
        filterByFormula: opts.filterByFormula,
        fields: opts.fields,
      view: opts.view,
      sort: opts.sort,
    });
    out.push(...res.records);
    if (opts.maxRecords && out.length >= opts.maxRecords) {
      return out.slice(0, opts.maxRecords);
    }
    if (!res.offset) break;
    offset = res.offset;
  }
  return out;
}

export type SimpleAttachment = { id: string; url: string; filename: string };

export function getAttachmentArray(fieldValue: unknown): SimpleAttachment[] {
  if (!Array.isArray(fieldValue)) return [];
  return fieldValue
    .map((a) => {
      if (a && typeof a === 'object') {
        const id = (a as any).id as string | undefined;
        const url = (a as any).url as string | undefined;
        const filename = (a as any).filename as string | undefined;
        if (id && url && filename) return { id, url, filename };
      }
      return null;
    })
    .filter(Boolean) as SimpleAttachment[];
}

export async function listRecordsByIds<TFields = Record<string, unknown>>(opts: {
  table: string;
  recordIds: string[];
  fields?: string[];
}): Promise<ListResponse<TFields>> {
  if (!opts.recordIds.length) return { records: [] };
  const formula = `OR(${opts.recordIds.map((id) => `RECORD_ID()='${id}'`).join(',')})`;
  return listRecords<TFields>({
    table: opts.table,
    filterByFormula: formula,
    fields: opts.fields,
    pageSize: 100,
  });
}
