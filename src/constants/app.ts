export const APP_NAME = 'CoinPilot';
export const DEFAULT_CURRENCY = 'usd';
export const MARKET_PAGE_SIZE = 100;
export const SEARCH_RESULT_LIMIT = 12;
export const COINPAPRIKA_BASE_URL = 'https://api.coinpaprika.com/v1';
export const QUERY_CACHE_KEY = 'coinpilot-query-cache-v1';

export const STORAGE_KEYS = {
  portfolio: 'coinpilot-portfolio-v1',
  settings: 'coinpilot-settings-v1',
  watchlist: 'coinpilot-watchlist-v1',
} as const;

export const QUERY_STALE_TIMES = {
  coinDetail: 1000 * 60 * 3,
  global: 1000 * 60 * 3,
  markets: 1000 * 60 * 2,
  ping: 1000 * 60,
  prices: 1000 * 45,
  search: 1000 * 60 * 10,
  trending: 1000 * 60 * 5,
} as const;
