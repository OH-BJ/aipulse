import type { Source, SourceData } from '../lib/types';
import { fetchHn } from './fetch-hn';
import { fetchArxiv } from './fetch-arxiv';
import { fetchGeeknews } from './fetch-geeknews';
import { writeSourceData } from './_shared';

type Task = { source: Source; run: () => Promise<SourceData> };

const TASKS: Task[] = [
  { source: 'hn', run: fetchHn },
  { source: 'arxiv', run: fetchArxiv },
  { source: 'geeknews', run: fetchGeeknews },
];

async function runOne(task: Task): Promise<{ source: Source; count: number; out?: string; error?: string }> {
  try {
    const data = await task.run();
    const out = await writeSourceData(data);
    return { source: task.source, count: data.items.length, out };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { source: task.source, count: 0, error: msg };
  }
}

async function main() {
  const results = await Promise.all(TASKS.map(runOne));
  let hadFailure = false;
  for (const r of results) {
    if (r.error) {
      hadFailure = true;
      console.error(`[${r.source}] FAILED: ${r.error}`);
    } else {
      console.log(`[${r.source}] ${r.count} items -> ${r.out}`);
    }
  }
  console.log(
    `\nSummary: ${results
      .map((r) => `${r.source}=${r.error ? 'ERR' : r.count}`)
      .join(', ')}`,
  );
  if (hadFailure) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[fetch-all] fatal:', err);
  process.exit(1);
});
