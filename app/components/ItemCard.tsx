import type { Item } from '@/lib/types';
import { extractDomain, timeAgo } from '@/lib/format';

interface Props {
  item: Item;
}

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.45,
  marginBottom: 6,
  color: 'var(--color-aip-text)',
  textDecoration: 'none',
  display: 'block',
};

const metaStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--color-aip-faint)',
  lineHeight: 1.3,
};

export default function ItemCard({ item }: Props) {
  if (item.source === 'arxiv') {
    return (
      <article>
        <div
          style={{
            fontSize: 11,
            color: 'var(--color-aip-accent)',
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            marginBottom: 5,
          }}
        >
          {item.id}
        </div>
        <a href={item.url} target="_blank" rel="noopener noreferrer" style={titleStyle}>
          {item.title}
        </a>
        <div style={metaStyle}>
          {item.author ? (
            <>
              <span>{item.author}</span>
              <span> · </span>
            </>
          ) : null}
          <span>{timeAgo(item.publishedAt)}</span>
        </div>
      </article>
    );
  }

  const domain = extractDomain(item.url);
  return (
    <article style={{ display: 'flex', gap: 11 }}>
      {typeof item.score === 'number' ? (
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--color-aip-score-text)',
            background: 'var(--color-aip-score-bg)',
            padding: '3px 7px',
            borderRadius: 6,
            minWidth: 32,
            textAlign: 'center',
            fontVariantNumeric: 'tabular-nums',
            height: 'fit-content',
            lineHeight: 1.3,
          }}
        >
          {item.score}
        </div>
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" style={titleStyle}>
          {item.title}
        </a>
        <div style={metaStyle}>
          {domain ? <span>{domain}</span> : null}
          {domain ? <span> · </span> : null}
          <span>{timeAgo(item.publishedAt)}</span>
          {item.author ? (
            <>
              <span> · </span>
              <span>{item.author}</span>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
