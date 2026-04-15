import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { requestTickersByIds } from '@/api/coinPaprika';
import { mapMarketCoin } from '@/api/mappers';
import { queryKeys } from '@/api/queryKeys';
import { QUERY_STALE_TIMES } from '@/constants/app';
import { useWatchlistStore } from '@/features/watchlist/store';

export function useWatchlistMarketsQuery(ids: string[]) {
  const migrateIds = useWatchlistStore((state) => state.migrateIds);

  const query = useQuery({
    enabled: ids.length > 0,
    queryFn: () => requestTickersByIds(ids),
    queryKey: queryKeys.marketsByIds(ids),
    select: (response) => ({
      idMapping: response.idMapping,
      markets: response.tickers.map(mapMarketCoin),
    }),
    staleTime: QUERY_STALE_TIMES.markets,
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
    data: query.data?.markets ?? [],
  };
}
