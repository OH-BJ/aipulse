// 소스 식별자
export type Source = 'hn' | 'arxiv' | 'geeknews';

// 모든 소스의 공통 글 형태
export interface Item {
  id: string;             // 소스 내 unique
  source: Source;
  title: string;
  url: string;            // 원본 링크
  score?: number;         // HN points, GeekNews upvotes (arxiv는 없음)
  commentsUrl?: string;   // 토론/원본 페이지
  author?: string;        // HN submitter, arxiv 저자
  publishedAt: string;    // ISO 8601 timestamp
  summary?: string;       // arxiv abstract 등 (선택)
}

// 한 소스의 fetch 결과 (JSON에 저장될 형태)
export interface SourceData {
  source: Source;
  fetchedAt: string;      // ISO 8601, fetch 시각
  items: Item[];
}