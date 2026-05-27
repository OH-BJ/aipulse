import { pathToFileURL } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import type { Item, SourceData } from '../lib/types';
import { fetchText, toIso, truncate, writeSourceData } from './_shared';

const FEEDS = [
  'https://rss.arxiv.org/rss/cs.AI',
  'https://rss.arxiv.org/rss/cs.LG',
];

interface RssItem {
  title?: string | { '#text'?: string };
  link?: string;
  description?: string;
  'dc:creator'?: string | string[];
  pubDate?: string;
  guid?: string | { '#text'?: string };
}

function textOf(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && '#text' in (v as Record<string, unknown>)) {
    return String((v as { '#text'?: unknown })['#text'] ?? '');
  }
  return String(v);
}

function arxivIdFromUrl(url: string): string | null {
  const m = url.match(/arxiv\.org\/abs\/([^\s?#]+)/i);
  if (m) return m[1].replace(/v\d+$/, '');
  const m2 = url.match(/arXiv:([^\s]+)/i);
  return m2 ? m2[1] : null;
}

function authorsField(raw: RssItem): string | undefined {
  const creators = raw['dc:creator'];
  let list: string[] = [];
  if (Array.isArray(creators)) {
    list = creators.map((c) => textOf(c)).filter(Boolean);
  } else if (creators) {
    const s = textOf(creators);
    // RSS often serializes multiple authors as comma-separated in dc:creator
    list = s.split(/,\s*/).map((x) => x.trim()).filter(Boolean);
  }
  if (list.length === 0) return undefined;
  if (list.length <= 3) return list.join(', ');
  return `${list.slice(0, 3).join(', ')} +${list.length - 3}`;
}

function abstractFromDescription(desc: string): string {
  // arXiv RSS description looks like:
  //   "arXiv:2605.12345v1 Announce Type: new\nAbstract: <actual text>"
  const noHtml = desc.replace(/<[^>]+>/g, ' ');
  const idx = noHtml.search(/Abstract:\s*/i);
  const body = idx >= 0 ? noHtml.slice(idx).replace(/^Abstract:\s*/i, '') : noHtml;
  return truncate(body, 200);
}

async function parseFeed(url: string): Promise<Item[]> {
  const xml = await fetchText(url);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel ?? doc?.feed ?? {};
  const rawItems: RssItem[] = Array.isArray(channel.item)
    ? channel.item
    : channel.item
      ? [channel.item]
      : [];

  const items: Item[] = [];
  for (const raw of rawItems) {
    const link = textOf(raw.link);
    const id = arxivIdFromUrl(link) ?? arxivIdFromUrl(textOf(raw.guid));
    if (!id) continue;
    const title = textOf(raw.title).trim();
    if (!title) continue;
    const publishedAt = raw.pubDate ? toIso(raw.pubDate) : toIso(Date.now());
    items.push({
      id,
      source: 'arxiv',
      title,
      url: link || `https://arxiv.org/abs/${id}`,
      author: authorsField(raw),
      publishedAt,
      summary: raw.description ? abstractFromDescription(textOf(raw.description)) : undefined,
    });
  }
  return items;
}

export async function fetchArxiv(): Promise<SourceData> {
  const results = await Promise.all(FEEDS.map((u) => parseFeed(u)));
  const merged = results.flat();

  const dedup = new Map<string, Item>();
  for (const it of merged) {
    if (!dedup.has(it.id)) dedup.set(it.id, it);
  }

  const items = Array.from(dedup.values())
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 30);

  return {
    source: 'arxiv',
    fetchedAt: toIso(Date.now()),
    items,
  };
}

async function main() {
  const data = await fetchArxiv();
  const out = await writeSourceData(data);
  console.log(`[arxiv] ${data.items.length} items -> ${out}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('[arxiv] failed:', err);
    process.exit(1);
  });
}
