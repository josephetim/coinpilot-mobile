import {
  applyMarketFilters,
  filterAndRankSearchMarkets,
} from '@/features/market/utils';
import { type MarketCoin } from '@/api/models';

const coins: MarketCoin[] = [
  {
    currentPrice: 100,
    id: 'bitcoin',
    image: 'btc.png',
    lastUpdated: null,
    marketCap: 1000,
    marketCapRank: 1,
    name: 'Bitcoin',
    priceChange24h: 1,
    priceChangePercentage24h: 4,
    sparkline: [],
    symbol: 'btc',
    totalVolume: 100,
  },
  {
    currentPrice: 10,
    id: 'ethereum',
    image: 'eth.png',
    lastUpdated: null,
    marketCap: 900,
    marketCapRank: 2,
    name: 'Ethereum',
    priceChange24h: -1,
    priceChangePercentage24h: -3,
    sparkline: [],
    symbol: 'eth',
    totalVolume: 100,
  },
  {
    currentPrice: 1,
    id: 'ethena',
    image: 'ena.png',
    lastUpdated: null,
    marketCap: 100,
    marketCapRank: 20,
    name: 'Ethena',
    priceChange24h: 2,
    priceChangePercentage24h: 10,
    sparkline: [],
    symbol: 'ena',
    totalVolume: 100,
  },
];

describe('market search and sort logic', () => {
  it('filters gainers and sorts them by 24h change', () => {
    const result = applyMarketFilters(coins, 'gainers', 'change_24h');

    expect(result.map((coin) => coin.id)).toEqual(['ethena', 'bitcoin']);
  });

  it('filters losers and sorts them ascending by 24h change', () => {
    const result = applyMarketFilters(coins, 'losers', 'change_24h');

    expect(result.map((coin) => coin.id)).toEqual(['ethereum']);
  });

  it('ranks exact symbol matches ahead of partial name matches', () => {
    const result = filterAndRankSearchMarkets(coins, 'eth');

    expect(result.map((coin) => coin.id)).toEqual(['ethereum', 'ethena']);
  });
});
