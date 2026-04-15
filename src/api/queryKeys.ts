export const queryKeys = {
  coinDetail: (id: string) => ['coinpilot', 'coin-detail', id] as const,
  global: () => ['coinpilot', 'global'] as const,
  markets: () => ['coinpilot', 'markets'] as const,
  marketsByIds: (ids: string[]) => ['coinpilot', 'markets-by-ids', [...ids].sort()] as const,
  ping: () => ['coinpilot', 'ping'] as const,
  prices: (ids: string[]) => ['coinpilot', 'prices', [...ids].sort()] as const,
  search: (query: string) => ['coinpilot', 'search', query.trim().toLowerCase()] as const,
  trending: () => ['coinpilot', 'trending'] as const,
} as const;
