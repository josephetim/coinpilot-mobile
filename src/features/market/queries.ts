import { useQuery } from '@tanstack/react-query';

import {
  requestCoinDetailBundle,
  requestGlobalOverview,
  requestMarketTickers,
  requestSearchCurrencies,
  requestTickersByIds,
} from '@/api/coinPaprika';
import {
  mapCoinDetail,
  mapGlobalOverview,
  mapMarketCoin,
  mapSearchCoins,
  mapTrendingCoins,
} from '@/api/mappers';
import { queryKeys } from '@/api/queryKeys';
import {
  MARKET_PAGE_SIZE,
  QUERY_STALE_TIMES,
  SEARCH_RESULT_LIMIT,
} from '@/constants/app';
import { filterAndRankSearchMarkets } from '@/features/market/utils';

export function useGlobalOverviewQuery() {
  return useQuery({
    queryFn: requestGlobalOverview,
    queryKey: queryKeys.global(),
    select: mapGlobalOverview,
    staleTime: QUERY_STALE_TIMES.global,
  });
}

export function useTrendingCoinsQuery() {
  return useQuery({
    queryFn: async () => {
      const tickers = await requestMarketTickers(MARKET_PAGE_SIZE);
      return [...tickers]
        .sort(
          (left, right) =>
            (right.quotes.USD?.volume_24h ?? 0) - (left.quotes.USD?.volume_24h ?? 0),
        )
        .slice(0, 12);
    },
    queryKey: queryKeys.trending(),
    select: mapTrendingCoins,
    staleTime: QUERY_STALE_TIMES.trending,
  });
}

export function useMarketCoinsQuery() {
  return useQuery({
    queryFn: () => requestMarketTickers(MARKET_PAGE_SIZE),
    queryKey: queryKeys.markets(),
    select: (response) => response.map(mapMarketCoin),
    staleTime: QUERY_STALE_TIMES.markets,
  });
}

export function useSearchMarketsQuery(query: string) {
  const normalizedQuery = query.trim();

  const searchQuery = useQuery({
    enabled: normalizedQuery.length >= 2,
    queryFn: () => requestSearchCurrencies(normalizedQuery, SEARCH_RESULT_LIMIT),
    queryKey: queryKeys.search(normalizedQuery),
    select: mapSearchCoins,
    staleTime: QUERY_STALE_TIMES.search,
  });

  const ids = searchQuery.data?.map((coin) => coin.id) ?? [];

  const marketsQuery = useQuery({
    enabled: ids.length > 0,
    queryFn: () => requestTickersByIds(ids, {}, { resolveLegacyIds: false }),
    queryKey: queryKeys.marketsByIds(ids),
    select: (response) =>
      filterAndRankSearchMarkets(response.tickers.map(mapMarketCoin), normalizedQuery),
    staleTime: QUERY_STALE_TIMES.search,
  });

  return {
    data: marketsQuery.data ?? [],
    error: searchQuery.error ?? marketsQuery.error,
    isEmpty:
      normalizedQuery.length >= 2 &&
      searchQuery.isSuccess &&
      ids.length === 0,
    isError: searchQuery.isError || marketsQuery.isError,
    isLoading:
      searchQuery.isLoading ||
      searchQuery.isFetching ||
      marketsQuery.isLoading ||
      marketsQuery.isFetching,
    refetch: async () => {
      await searchQuery.refetch();
      if (ids.length > 0) {
        await marketsQuery.refetch();
      }
    },
  };
}

export function useCoinDetailQuery(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => requestCoinDetailBundle(id),
    queryKey: queryKeys.coinDetail(id),
    select: (response) =>
      mapCoinDetail({
        coin: response.coin,
        ohlcv: response.ohlcv,
        ticker: response.ticker,
      }),
    staleTime: QUERY_STALE_TIMES.coinDetail,
  });
}
