import {
  coinPaprikaLogoUrl,
  mapCoinDetail,
  mapGlobalOverview,
  mapMarketCoin,
  mapOhlcvToSparkline,
  mapSimplePrices,
  mapTrendingCoins,
} from '@/api/mappers';

describe('api mappers', () => {
  it('maps global overview response', () => {
    const mapped = mapGlobalOverview({
      bitcoin_dominance_percentage: 53.2,
      cryptocurrencies_number: 12345,
      last_updated: 123,
      market_cap_change_24h: 2.5,
      market_cap_usd: 1000000,
      volume_24h_usd: 500000,
    });

    expect(mapped.totalMarketCapUsd).toBe(1000000);
    expect(mapped.btcDominance).toBe(53.2);
  });

  it('maps market and trending responses into ui models', () => {
    const marketCoin = mapMarketCoin({
      id: 'btc-bitcoin',
      last_updated: '2026-04-14T00:00:00Z',
      max_supply: 21,
      name: 'Bitcoin',
      quotes: {
        USD: {
          market_cap: 1000000,
          percent_change_24h: 3.5,
          price: 102,
          volume_24h: 50000,
        },
      },
      rank: 1,
      symbol: 'btc',
      total_supply: 19,
    });

    const trending = mapTrendingCoins([
      {
        id: 'sol-solana',
        last_updated: '2026-04-14T00:00:00Z',
        name: 'Solana',
        quotes: {
          USD: {
            percent_change_24h: 5.5,
            price: 2,
            volume_24h: 1000,
          },
        },
        rank: 5,
        symbol: 'sol',
      },
      {
        id: 'eth-ethereum',
        last_updated: '2026-04-14T00:00:00Z',
        name: 'Ethereum',
        quotes: {
          USD: {
            percent_change_24h: -0.5,
            price: 10,
            volume_24h: 2000,
          },
        },
        rank: 2,
        symbol: 'eth',
      },
    ]);

    expect(marketCoin.image).toBe(coinPaprikaLogoUrl('btc-bitcoin'));
    expect(marketCoin.priceChangePercentage24h).toBe(3.5);
    expect(trending[0].summary).toBeNull();
  });

  it('maps detail and simple price responses', () => {
    const detail = mapCoinDetail({
      coin: {
        description: '<p>Bitcoin &amp; security</p>',
        id: 'btc-bitcoin',
        logo: 'btc.png',
        name: 'Bitcoin',
        rank: 1,
        symbol: 'btc',
      },
      ohlcv: [
        {
          close: 90100,
          high: 91000,
          low: 87000,
          market_cap: 1000000,
          open: 90000,
          time_close: '2026-04-14T23:59:59Z',
          time_open: '2026-04-14T00:00:00Z',
          volume: 5000,
        },
        {
          close: 90000,
          high: 91000,
          low: 87000,
          market_cap: 1000000,
          open: 89000,
          time_close: '2026-04-15T23:59:59Z',
          time_open: '2026-04-15T00:00:00Z',
          volume: 5000,
        },
      ],
      ticker: {
        circulating_supply: 10,
        id: 'btc-bitcoin',
        last_updated: '2026-04-15T00:00:00Z',
        max_supply: 21,
        name: 'Bitcoin',
        quotes: {
          USD: {
            market_cap: 1000000,
            percent_change_24h: 2,
            price: 90000,
            volume_24h: 5000,
          },
        },
        rank: 1,
        symbol: 'btc',
        total_supply: 20,
      },
    });

    const prices = mapSimplePrices([
      {
        id: 'btc-bitcoin',
        last_updated: '2026-04-15T00:00:00Z',
        name: 'Bitcoin',
        quotes: {
          USD: {
            percent_change_24h: 2,
            price: 90000,
          },
        },
        rank: 1,
        symbol: 'btc',
      },
    ]);

    expect(detail.summary).toBe('Bitcoin & security');
    expect(detail.sparkline).toEqual([90100, 90000]);
    expect(prices['btc-bitcoin'].usd24hChange).toBe(2);
  });

  it('falls back to open+close when OHLC historical range is sparse', () => {
    const sparkline = mapOhlcvToSparkline([
      {
        close: 102,
        high: 103,
        low: 99,
        market_cap: 1000,
        open: 100,
        time_close: '2026-04-15T23:59:59Z',
        time_open: '2026-04-15T00:00:00Z',
        volume: 1,
      },
    ]);

    expect(sparkline).toEqual([100, 102]);
  });
});
