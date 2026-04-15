import { buildUrl } from '@/api/client';

describe('api client url building', () => {
  it('builds urls under the /v1 base path for slash-prefixed endpoints', () => {
    expect(buildUrl('/global').toString()).toBe('https://api.coinpaprika.com/v1/global');
    expect(buildUrl('/tickers').toString()).toBe('https://api.coinpaprika.com/v1/tickers');
    expect(buildUrl('/search').toString()).toBe('https://api.coinpaprika.com/v1/search');
  });

  it('preserves existing query param behavior', () => {
    const url = buildUrl('/search', {
      c: 'currencies',
      empty: '',
      flag: true,
      limit: 10,
      q: 'btc',
    });

    expect(url.toString()).toContain('https://api.coinpaprika.com/v1/search?');
    expect(url.searchParams.get('c')).toBe('currencies');
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.get('flag')).toBe('true');
    expect(url.searchParams.get('q')).toBe('btc');
    expect(url.searchParams.get('empty')).toBeNull();
  });
});
