import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { SourceData } from '../lib/types';

export const DATA_DIR = resolve(process.cwd(), 'data');

export async function writeSourceData(data: SourceData): Promise<string> {
  const out = resolve(DATA_DIR, `${data.source}.json`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(data, null, 2), 'utf-8');
  return out;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'user-agent': 'aipulse-fetcher/0.1' } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'user-agent': 'aipulse-fetcher/0.1' } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

export function toIso(d: Date | number | string): string {
  return new Date(d).toISOString();
}

export function truncate(text: string, n: number): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > n ? t.slice(0, n).trimEnd() + '…' : t;
}
