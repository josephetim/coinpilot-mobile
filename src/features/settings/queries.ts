import { useQuery } from '@tanstack/react-query';

import { requestGlobalOverview } from '@/api/coinPaprika';
import { queryKeys } from '@/api/queryKeys';
import { QUERY_STALE_TIMES } from '@/constants/app';

export function useApiHealthQuery() {
  return useQuery({
    queryFn: requestGlobalOverview,
    queryKey: queryKeys.ping(),
    staleTime: QUERY_STALE_TIMES.ping,
  });
}
