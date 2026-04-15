export interface PortfolioHolding {
  averageCostUsd: number | null;
  id: string;
  image: string;
  name: string;
  quantity: number;
  symbol: string;
}

export interface PortfolioPriceMap {
  [id: string]: {
    usd: number | null;
    usd24hChange: number | null;
  };
}

export interface PortfolioValuationItem extends PortfolioHolding {
  costBasisUsd: number | null;
  currentPriceUsd: number | null;
  currentValueUsd: number | null;
  pnlPercentage: number | null;
  pnlUsd: number | null;
  priceChangePercentage24h: number | null;
}

export interface PortfolioSummary {
  holdingsCount: number;
  totalCostBasisUsd: number;
  totalPnlPercentage: number | null;
  totalPnlUsd: number;
  totalValueUsd: number;
}

export function upsertHolding(
  holdings: PortfolioHolding[],
  nextHolding: PortfolioHolding,
) {
  const existing = holdings.find((holding) => holding.id === nextHolding.id);

  if (!existing) {
    return [nextHolding, ...holdings];
  }

  const mergedQuantity = existing.quantity + nextHolding.quantity;
  const mergedCost =
    existing.averageCostUsd !== null && nextHolding.averageCostUsd !== null
      ? (existing.averageCostUsd * existing.quantity +
          nextHolding.averageCostUsd * nextHolding.quantity) /
        mergedQuantity
      : nextHolding.averageCostUsd ?? existing.averageCostUsd;

  return holdings.map((holding) =>
    holding.id === nextHolding.id
      ? {
          ...holding,
          averageCostUsd: mergedCost,
          quantity: mergedQuantity,
        }
      : holding,
  );
}

export function calculatePortfolioValuation(
  holdings: PortfolioHolding[],
  priceMap: PortfolioPriceMap,
) {
  const items: PortfolioValuationItem[] = holdings.map((holding) => {
    const price = priceMap[holding.id];
    const currentPriceUsd = price?.usd ?? null;
    const currentValueUsd =
      currentPriceUsd === null ? null : currentPriceUsd * holding.quantity;
    const costBasisUsd =
      holding.averageCostUsd === null
        ? null
        : holding.averageCostUsd * holding.quantity;
    const pnlUsd =
      currentValueUsd === null || costBasisUsd === null
        ? null
        : currentValueUsd - costBasisUsd;
    const pnlPercentage =
      pnlUsd === null || costBasisUsd === null || costBasisUsd === 0
        ? null
        : (pnlUsd / costBasisUsd) * 100;

    return {
      ...holding,
      costBasisUsd,
      currentPriceUsd,
      currentValueUsd,
      pnlPercentage,
      pnlUsd,
      priceChangePercentage24h: price?.usd24hChange ?? null,
    };
  });

  const totalValueUsd = items.reduce(
    (total, item) => total + (item.currentValueUsd ?? 0),
    0,
  );
  const totalCostBasisUsd = items.reduce(
    (total, item) => total + (item.costBasisUsd ?? 0),
    0,
  );
  const totalPnlUsd = totalValueUsd - totalCostBasisUsd;
  const totalPnlPercentage =
    totalCostBasisUsd > 0 ? (totalPnlUsd / totalCostBasisUsd) * 100 : null;

  const summary: PortfolioSummary = {
    holdingsCount: items.length,
    totalCostBasisUsd,
    totalPnlPercentage,
    totalPnlUsd,
    totalValueUsd,
  };

  return {
    items,
    summary,
  };
}
