import { request } from '@/api/client';
import {
  applyCoinIdMapping,
  resolveCoinPaprikaId,
  resolveCoinPaprikaIds,
} from '@/api/idResolver';
import {
  type CoinPaprikaCoinResponse,
  type CoinPaprikaGlobalResponse,
  type CoinPaprikaOhlcvPointResponse,
  type CoinPaprikaSearchResponse,
  type CoinPaprikaTickerResponse,
} from '@/api/types';

export async function requestGlobalOverview() {
  return request<CoinPaprikaGlobalResponse>('/global');
}

export async function requestMarketTickers(limit: number) {
  return request<CoinPaprikaTickerResponse[]>('/tickers', {
    limit,
    quotes: 'USD',
  });
}

export async function requestSearchCurrencies(query: string, limit: number) {
  return request<CoinPaprikaSearchResponse>('/search', {
    c: 'currencies',
    limit,
    q: query,
  });
}

export async function requestTickersByIds(
  ids: string[],
  hintsById: Record<string, { name?: string; symbol?: string }> = {},
  options: { resolveLegacyIds?: boolean } = {},
) {
  const resolveLegacyIds = options.resolveLegacyIds ?? true;
  const idMapping = resolveLegacyIds
    ? await resolveCoinPaprikaIds(ids, hintsById)
    : ids.reduce<Record<string, string>>((accumulator, id) => {
        accumulator[id] = id;
        return accumulator;
      }, {});
  const resolvedIds = resolveLegacyIds
    ? applyCoinIdMapping(ids, idMapping)
    : [...new Set(ids)];

  const settled = await Promise.allSettled(
    resolvedIds.map((id) => request<CoinPaprikaTickerResponse>(`/tickers/${id}`)),
  );

  const tickers = settled
    .filter(
      (result): result is PromiseFulfilledResult<CoinPaprikaTickerResponse> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value);
  const rejected = settled.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (tickers.length === 0 && rejected) {
    throw rejected.reason;
  }

  return {
    idMapping,
    tickers,
  };
}

export async function requestCoinDetailBundle(rawId: string) {
  const resolvedId = (await resolveCoinPaprikaId(rawId)) ?? rawId;

  const [coin, ticker, ohlcv] = await Promise.all([
    request<CoinPaprikaCoinResponse>(`/coins/${resolvedId}`),
    request<CoinPaprikaTickerResponse>(`/tickers/${resolvedId}`),
    requestHistoricalOhlcv(resolvedId),
  ]);

  return {
    coin,
    ohlcv,
    resolvedId,
    ticker,
  };
}

async function requestHistoricalOhlcv(coinId: string) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 1000 * 60 * 60 * 24 * 7);

  try {
    const response = await request<CoinPaprikaOhlcvPointResponse[]>(
      `/coins/${coinId}/ohlcv/historical`,
      {
        end: endDate.toISOString(),
        start: startDate.toISOString(),
      },
    );

    return response;
  } catch {
    // Some plans do not allow full historical windows. Fall back to the latest candle.
    try {
      const latest = await request<CoinPaprikaOhlcvPointResponse>(
        `/coins/${coinId}/ohlcv/latest`,
      );
      return latest ? [latest] : [];
    } catch {
      return [];
    }
  }
}
