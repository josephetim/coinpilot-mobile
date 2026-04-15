import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { requestTickersByIds } from '@/api/coinPaprika';
import { mapSimplePrices } from '@/api/mappers';
import { queryKeys } from '@/api/queryKeys';
import { QUERY_STALE_TIMES } from '@/constants/app';
import { usePortfolioStore } from '@/features/portfolio/store';
import { type PortfolioHolding } from '@/features/portfolio/utils';

export function usePortfolioPricesQuery(holdings: PortfolioHolding[]) {
  const migrateIds = usePortfolioStore((state) => state.migrateIds);
  const ids = holdings.map((holding) => holding.id);
  const hintsById = holdings.reduce<Record<string, { name: string; symbol: string }>>(
    (accumulator, holding) => {
      accumulator[holding.id] = {
        name: holding.name,
        symbol: holding.symbol,
      };
      return accumulator;
    },
    {},
  );

  const query = useQuery({
    enabled: ids.length > 0,
    queryFn: () => requestTickersByIds(ids, hintsById),
    queryKey: queryKeys.prices(ids),
    select: (response) => ({
      idMapping: response.idMapping,
      prices: mapSimplePrices(response.tickers),
    }),
    staleTime: QUERY_STALE_TIMES.prices,
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const hasMappingChanges = ids.some((id) => (query.data.idMapping[id] ?? id) !== id);
    if (hasMappingChanges) {
      migrateIds(query.data.idMapping);
    }
  }, [ids, migrateIds, query.data]);

  return {
    ...query,
    data: query.data?.prices ?? {},
  };
}
