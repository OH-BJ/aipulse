import { pathToFileURL } from 'node:url';
import type { Item, SourceData } from '../lib/types';
import { fetchJson, toIso, writeSourceData } from './_shared';

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';
const AI_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'llama',
  'mistral', 'anthropic', 'openai', 'deepseek', 'qwen',
];

interface HnStory {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  by?: string;
  time?: number;
  type?: string;
}

function matchesAi(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, 'i');
    return re.test(lower);
  });
}

export async function fetchHn(): Promise<SourceData> {
  const topIds = await fetchJson<number[]>(`${HN_BASE}/topstories.json`);
  const ids = topIds.slice(0, 100);

  const stories = await Promise.all(
    ids.map((id) =>
      fetchJson<HnStory | null>(`${HN_BASE}/item/${id}.json`).catch(() => null),
    ),
  );

  const items: Item[] = [];
  for (const s of stories) {
    if (!s || !s.title || !s.time) continue;
    if (!matchesAi(s.title)) continue;
    items.push({
      id: String(s.id),
      source: 'hn',
      title: s.title,
      url: s.url ?? `https://news.ycombinator.com/item?id=${s.id}`,
      score: s.score,
      commentsUrl: `https://news.ycombinator.com/item?id=${s.id}`,
      author: s.by,
      publishedAt: toIso(s.time * 1000),
    });
    if (items.length >= 30) break;
  }

  return {
    source: 'hn',
    fetchedAt: toIso(Date.now()),
    items,
  };
}

async function main() {
  const data = await fetchHn();
  const out = await writeSourceData(data);
  console.log(`[hn] ${data.items.length} items -> ${out}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('[hn] failed:', err);
    process.exit(1);
  });
}
