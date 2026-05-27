'use client';

import { useState, type ReactNode } from 'react';
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

const COLLAPSED_LIMIT = 15;

export default function SourceSection({ source, icon }: Props) {
  const items = source.items;
  const [expanded, setExpanded] = useState(false);

  const showToggle = items.length > COLLAPSED_LIMIT;
  const visible = expanded ? items : items.slice(0, COLLAPSED_LIMIT);
  const hiddenCount = items.length - COLLAPSED_LIMIT;

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
        {visible.map((item, i) => (
          <div
            key={`${item.source}-${item.id}`}
            style={{
              padding: '14px 0',
              borderBottom:
                i === visible.length - 1 && !showToggle
                  ? 'none'
                  : '0.5px solid var(--color-aip-divider)',
            }}
          >
            <ItemCard item={item} />
          </div>
        ))}
        {showToggle ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="aip-show-more"
            aria-expanded={expanded}
          >
            {expanded ? 'Show less' : `Show ${hiddenCount} more`}
          </button>
        ) : null}
      </div>
    </section>
  );
}
