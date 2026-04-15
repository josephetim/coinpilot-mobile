import {
  calculatePortfolioValuation,
  upsertHolding,
  type PortfolioHolding,
} from '@/features/portfolio/utils';

describe('portfolio valuation math', () => {
  it('merges existing holdings with weighted average cost', () => {
    const holdings: PortfolioHolding[] = [
      {
        averageCostUsd: 100,
        id: 'bitcoin',
        image: 'btc.png',
        name: 'Bitcoin',
        quantity: 1,
        symbol: 'btc',
      },
    ];

    const result = upsertHolding(holdings, {
      averageCostUsd: 200,
      id: 'bitcoin',
      image: 'btc.png',
      name: 'Bitcoin',
      quantity: 2,
      symbol: 'btc',
    });

    expect(result[0].quantity).toBe(3);
    expect(result[0].averageCostUsd).toBeCloseTo(166.6667, 4);
  });

  it('computes current value and pnl summary', () => {
    const valuation = calculatePortfolioValuation(
      [
        {
          averageCostUsd: 100,
          id: 'bitcoin',
          image: 'btc.png',
          name: 'Bitcoin',
          quantity: 2,
          symbol: 'btc',
        },
      ],
      {
        bitcoin: {
          usd: 125,
          usd24hChange: 5,
        },
      },
    );

    expect(valuation.items[0].currentValueUsd).toBe(250);
    expect(valuation.items[0].pnlUsd).toBe(50);
    expect(valuation.summary.totalValueUsd).toBe(250);
    expect(valuation.summary.totalPnlPercentage).toBe(25);
  });
});
