import fs from 'node:fs';
import path from 'node:path';
import { BookOpen, Flame, Newspaper } from 'lucide-react';
import type { Source, SourceData } from '@/lib/types';
import { timeAgo } from '@/lib/format';
import SourceSection from './components/SourceSection';
import ThemeToggle from './components/ThemeToggle';

function loadSource(source: Source): SourceData {
  const fallback: SourceData = {
    source,
    fetchedAt: new Date(0).toISOString(),
    items: [],
  };
  try {
    const file = path.join(process.cwd(), 'data', `${source}.json`);
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(raw) as SourceData;
    if (!parsed || !Array.isArray(parsed.items)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function latestFetchedAt(...sources: SourceData[]): string | null {
  let latest = 0;
  for (const s of sources) {
    const t = new Date(s.fetchedAt).getTime();
    if (Number.isFinite(t) && t > latest) latest = t;
  }
  return latest > 0 ? new Date(latest).toISOString() : null;
}

export default function Home() {
  const hn = loadSource('hn');
  const arxiv = loadSource('arxiv');
  const geeknews = loadSource('geeknews');
  const latest = latestFetchedAt(hn, arxiv, geeknews);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 w-full">
      <header
        className="flex items-center justify-between"
        style={{
          marginBottom: 22,
          paddingBottom: 16,
          borderBottom: '0.5px solid var(--color-aip-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ fontSize: 19, fontWeight: 500 }}>AIpulse</h1>
          {latest ? (
            <span style={{ fontSize: 12, color: 'var(--color-aip-muted)' }}>
              Last fetched {timeAgo(latest)} ago
            </span>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--color-aip-muted)' }}>
              No data yet
            </span>
          )}
        </div>
        <ThemeToggle />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SourceSection source={hn} icon={<Flame size={16} />} />
        <SourceSection source={arxiv} icon={<BookOpen size={16} />} />
        <SourceSection source={geeknews} icon={<Newspaper size={16} />} />
      </main>
    </div>
  );
}
