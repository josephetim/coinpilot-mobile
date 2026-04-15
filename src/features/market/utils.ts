import { type MarketCoin } from '@/api/models';

export type MarketSortKey = 'change_24h' | 'market_cap' | 'price';
export type MarketFilterKey = 'all' | 'gainers' | 'losers';

function compareNullableNumbers(
  left: number | null | undefined,
  right: number | null | undefined,
  direction: 'asc' | 'desc',
) {
  if (left === null || left === undefined) {
    return 1;
  }

  if (right === null || right === undefined) {
    return -1;
  }

  return direction === 'asc' ? left - right : right - left;
}

function normalizedText(value: string) {
  return value.trim().toLowerCase();
}

export function applyMarketFilters(
  coins: MarketCoin[],
  filterKey: MarketFilterKey,
  sortKey: MarketSortKey,
) {
  const filtered = coins.filter((coin) => {
    if (filterKey === 'gainers') {
      return (coin.priceChangePercentage24h ?? 0) > 0;
    }

    if (filterKey === 'losers') {
      return (coin.priceChangePercentage24h ?? 0) < 0;
    }

    return true;
  });

  return [...filtered].sort((left, right) => {
    if (sortKey === 'market_cap') {
      return compareNullableNumbers(left.marketCap, right.marketCap, 'desc');
    }

    if (sortKey === 'price') {
      return compareNullableNumbers(left.currentPrice, right.currentPrice, 'desc');
    }

    return compareNullableNumbers(
      left.priceChangePercentage24h,
      right.priceChangePercentage24h,
      filterKey === 'losers' ? 'asc' : 'desc',
    );
  });
}

export function scoreSearchMatch(coin: Pick<MarketCoin, 'name' | 'symbol'>, query: string) {
  const normalizedQuery = normalizedText(query);
  const normalizedName = normalizedText(coin.name);
  const normalizedSymbol = normalizedText(coin.symbol);

  if (!normalizedQuery) {
    return Number.POSITIVE_INFINITY;
  }

  if (normalizedSymbol === normalizedQuery) {
    return 0;
  }

  if (normalizedName === normalizedQuery) {
    return 1;
  }

  if (normalizedSymbol.startsWith(normalizedQuery)) {
    return 2;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 3;
  }

  if (normalizedSymbol.includes(normalizedQuery)) {
    return 4;
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 5;
  }

  return Number.POSITIVE_INFINITY;
}

export function filterAndRankSearchMarkets(coins: MarketCoin[], query: string) {
  return [...coins]
    .filter((coin) => scoreSearchMatch(coin, query) < Number.POSITIVE_INFINITY)
    .sort((left, right) => {
      const leftScore = scoreSearchMatch(left, query);
      const rightScore = scoreSearchMatch(right, query);

      if (leftScore !== rightScore) {
        return leftScore - rightScore;
      }

      return compareNullableNumbers(left.marketCap, right.marketCap, 'desc');
    });
}
