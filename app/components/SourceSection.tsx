import type { ReactNode } from 'react';
import type { SourceData } from '@/lib/types';
import ItemCard from './ItemCard';

interface Props {
  source: SourceData;
  icon: ReactNode;
}

const LABELS: Record<SourceData['source'], string> = {
  hn: 'Hacker News',
  arxiv: 'arXiv',
  geeknews: 'GeekNews',
};

export default function SourceSection({ source, icon }: Props) {
  const items = source.items;
  return (
    <section>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingLeft: 2,
          marginBottom: 16,
          color: 'var(--color-aip-text)',
        }}
      >
        <span style={{ color: 'var(--color-aip-accent)', display: 'inline-flex' }}>
          {icon}
        </span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{LABELS[source.source]}</span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-aip-faint)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {items.length}
        </span>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <div
            key={`${item.source}-${item.id}`}
            style={{
              padding: '14px 0',
              borderBottom:
                i === items.length - 1
                  ? 'none'
                  : '0.5px solid var(--color-aip-divider)',
            }}
          >
            <ItemCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
