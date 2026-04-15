import { useEffect, useRef } from 'react';

import { resolveCoinPaprikaIds } from '@/api/idResolver';
import { usePortfolioStore } from '@/features/portfolio/store';
import { useWatchlistStore } from '@/features/watchlist/store';

function hasIdChanges(ids: string[], mapping: Record<string, string>) {
  return ids.some((id) => (mapping[id] ?? id) !== id);
}

export function CoinIdMigrationGate() {
  const watchlistIds = useWatchlistStore((state) => state.ids);
  const migrateWatchlistIds = useWatchlistStore((state) => state.migrateIds);
  const holdings = usePortfolioStore((state) => state.holdings);
  const migratePortfolioIds = usePortfolioStore((state) => state.migrateIds);
  const previousSignature = useRef<string>('');

  useEffect(() => {
    const watchlistSignature = watchlistIds.join('|');
    const portfolioSignature = holdings.map((holding) => holding.id).join('|');
    const signature = `${watchlistSignature}::${portfolioSignature}`;

    if (!signature || signature === previousSignature.current) {
      return;
    }

    previousSignature.current = signature;

    const ids = [...new Set([...watchlistIds, ...holdings.map((holding) => holding.id)])];
    if (ids.length === 0) {
      return;
    }

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

    let cancelled = false;

    void (async () => {
      const mapping = await resolveCoinPaprikaIds(ids, hintsById);
      if (cancelled) {
        return;
      }

      if (hasIdChanges(watchlistIds, mapping)) {
        migrateWatchlistIds(mapping);
      }

      if (hasIdChanges(holdings.map((holding) => holding.id), mapping)) {
        migratePortfolioIds(mapping);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    holdings,
    migratePortfolioIds,
    migrateWatchlistIds,
    watchlistIds,
  ]);

  return null;
}
