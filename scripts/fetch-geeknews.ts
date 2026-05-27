import { pathToFileURL } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import type { Item, SourceData } from '../lib/types';
import { fetchText, toIso, writeSourceData } from './_shared';

const FEED_URL = 'https://news.hada.io/rss/news';

interface FeedEntry {
  title?: unknown;
  link?: unknown;
  guid?: unknown;
  id?: unknown;
  pubDate?: string;
  published?: string;
  updated?: string;
  description?: unknown;
  summary?: unknown;
  content?: unknown;
  comments?: unknown;
  author?: unknown;
  'dc:creator'?: unknown;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function textOf(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) {
    for (const el of v) {
      const t = textOf(el);
      if (t) return t;
    }
    return '';
  }
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    if ('@_href' in obj) return String(obj['@_href']);
    if ('#text' in obj) return String(obj['#text']);
    if ('name' in obj) return String(obj.name);
  }
  return String(v);
}

function idFromTopicUrl(url: string): string | undefined {
  const m = url.match(/[?&]id=(\d+)/);
  return m ? m[1] : undefined;
}

function firstExternalHref(html: string): string | undefined {
  const re = /<a\s[^>]*href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (!/^https?:\/\//i.test(href)) continue;
    if (/(^|\.)news\.hada\.io(\/|$)/i.test(href)) continue;
    return href;
  }
  return undefined;
}

export async function fetchGeeknews(): Promise<SourceData> {
  const xml = await fetchText(FEED_URL);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
    cdataPropName: '#text',
  });
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel ?? doc?.feed ?? {};
  const rawEntries: FeedEntry[] = Array.isArray(channel.item)
    ? channel.item
    : channel.item
      ? [channel.item]
      : Array.isArray(channel.entry)
        ? channel.entry
        : channel.entry
          ? [channel.entry]
          : [];

  const items: Item[] = [];
  for (const raw of rawEntries) {
    const titleRaw = textOf(raw.title).trim();
    if (!titleRaw) continue;
    const title = decodeEntities(titleRaw);

    const linkText = textOf(raw.link);
    const guidText = textOf(raw.guid) || textOf(raw.id);
    const topicUrl = linkText || guidText;
    const id = idFromTopicUrl(topicUrl) || guidText || topicUrl;
    if (!id) continue;

    const contentHtml = textOf(raw.content) || textOf(raw.description) || textOf(raw.summary);
    const external = contentHtml ? firstExternalHref(contentHtml) : undefined;

    const publishedRaw =
      raw.published ?? raw.pubDate ?? raw.updated ?? new Date().toISOString();

    items.push({
      id: String(id),
      source: 'geeknews',
      title,
      url: external ?? topicUrl,
      commentsUrl: topicUrl || undefined,
      author: textOf(raw.author) || textOf(raw['dc:creator']) || undefined,
      publishedAt: toIso(publishedRaw),
    });
    if (items.length >= 30) break;
  }

  return {
    source: 'geeknews',
    fetchedAt: toIso(Date.now()),
    items,
  };
}

async function main() {
  const data = await fetchGeeknews();
  const out = await writeSourceData(data);
  console.log(`[geeknews] ${data.items.length} items -> ${out}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('[geeknews] failed:', err);
    process.exit(1);
  });
}
