import {
  type CoinDetail,
  type GlobalOverview,
  type MarketCoin,
  type SearchCoin,
  type SimplePricePoint,
  type TrendingCoin,
} from '@/api/models';
import {
  type CoinPaprikaCoinResponse,
  type CoinPaprikaGlobalResponse,
  type CoinPaprikaOhlcvPointResponse,
  type CoinPaprikaSearchResponse,
  type CoinPaprikaTickerResponse,
} from '@/api/types';
import { toPlainTextSummary } from '@/utils/html';

function parseUnixSeconds(dateValue: string | null | undefined) {
  if (!dateValue) {
    return null;
  }

  const timestamp = Math.floor(new Date(dateValue).getTime() / 1000);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function calculatePriceChange24h(
  currentPrice: number | null,
  changePercent24h: number | null,
) {
  if (currentPrice === null || changePercent24h === null) {
    return null;
  }

  const denominator = 1 + changePercent24h / 100;
  if (denominator === 0) {
    return null;
  }

  const previousPrice = currentPrice / denominator;
  return currentPrice - previousPrice;
}

export function coinPaprikaLogoUrl(id: string) {
  return `https://static.coinpaprika.com/coin/${id}/logo.png`;
}

export function mapGlobalOverview(response: CoinPaprikaGlobalResponse): GlobalOverview {
  return {
    activeCryptocurrencies: response.cryptocurrencies_number,
    btcDominance: response.bitcoin_dominance_percentage,
    marketCapChange24h: response.market_cap_change_24h,
    // CoinPaprika global endpoint doesn't expose market count as a separate field.
    markets: response.cryptocurrencies_number,
    totalMarketCapUsd: response.market_cap_usd,
    totalVolumeUsd: response.volume_24h_usd,
    updatedAt: response.last_updated,
  };
}

export function mapMarketCoin(ticker: CoinPaprikaTickerResponse): MarketCoin {
  const quote = ticker.quotes.USD;
  const currentPrice = quote?.price ?? null;
  const priceChangePercentage24h = quote?.percent_change_24h ?? null;

  return {
    currentPrice,
    id: ticker.id,
    image: coinPaprikaLogoUrl(ticker.id),
    lastUpdated: ticker.last_updated,
    marketCap: quote?.market_cap ?? null,
    marketCapRank: ticker.rank,
    name: ticker.name,
    priceChange24h: calculatePriceChange24h(currentPrice, priceChangePercentage24h),
    priceChangePercentage24h,
    sparkline: [],
    symbol: ticker.symbol,
    totalVolume: quote?.volume_24h ?? null,
  };
}

export function mapTrendingCoins(tickers: CoinPaprikaTickerResponse[]): TrendingCoin[] {
  return tickers.map((ticker) => ({
    id: ticker.id,
    image: coinPaprikaLogoUrl(ticker.id),
    marketCapRank: ticker.rank,
    name: ticker.name,
    price: ticker.quotes.USD?.price ?? null,
    priceChangePercentage24h: ticker.quotes.USD?.percent_change_24h ?? null,
    summary: null,
    symbol: ticker.symbol,
  }));
}

export function mapSearchCoins(response: CoinPaprikaSearchResponse): SearchCoin[] {
  return (response.currencies ?? [])
    .filter((coin) => coin.is_active)
    .map((coin) => ({
      id: coin.id,
      image: coinPaprikaLogoUrl(coin.id),
      marketCapRank: coin.rank,
      name: coin.name,
      symbol: coin.symbol,
    }));
}

export function mapOhlcvToSparkline(
  points: CoinPaprikaOhlcvPointResponse[],
  fallbackPrice: number | null = null,
) {
  const values = points
    .map((point) => point.close)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (values.length > 1) {
    return values;
  }

  const latestPoint = points.at(-1);
  const open = latestPoint?.open;
  const close = latestPoint?.close;
  if (
    values.length === 1 &&
    typeof open === 'number' &&
    Number.isFinite(open) &&
    typeof close === 'number' &&
    Number.isFinite(close) &&
    open !== close
  ) {
    return [open, close];
  }

  if (values.length === 1) {
    return values;
  }

  if (fallbackPrice !== null && Number.isFinite(fallbackPrice)) {
    return [fallbackPrice];
  }

  return [];
}

export function mapCoinDetail(input: {
  coin: CoinPaprikaCoinResponse;
  ohlcv: CoinPaprikaOhlcvPointResponse[];
  ticker: CoinPaprikaTickerResponse;
}): CoinDetail {
  const { coin, ohlcv, ticker } = input;
  const quote = ticker.quotes.USD;
  const currentPrice = quote?.price ?? null;
  const priceChangePercentage24h = quote?.percent_change_24h ?? null;

  return {
    circulatingSupply: ticker.circulating_supply ?? null,
    currentPrice,
    // 24h high/low are not available in CoinPaprika free ticker responses.
    high24h: null,
    id: coin.id,
    image: coin.logo || coinPaprikaLogoUrl(coin.id),
    low24h: null,
    marketCap: quote?.market_cap ?? null,
    marketCapRank: ticker.rank ?? coin.rank,
    maxSupply: ticker.max_supply ?? null,
    name: coin.name,
    priceChange24h: calculatePriceChange24h(currentPrice, priceChangePercentage24h),
    priceChangePercentage24h,
    sparkline: mapOhlcvToSparkline(ohlcv, currentPrice),
    summary: toPlainTextSummary(coin.description ?? null),
    symbol: coin.symbol,
    totalSupply: ticker.total_supply ?? null,
    totalVolume: quote?.volume_24h ?? null,
  };
}

export function mapSimplePrices(tickers: CoinPaprikaTickerResponse[]): Record<string, SimplePricePoint> {
  return tickers.reduce<Record<string, SimplePricePoint>>((accumulator, ticker) => {
    accumulator[ticker.id] = {
      id: ticker.id,
      lastUpdatedAt: parseUnixSeconds(ticker.last_updated),
      usd: ticker.quotes.USD?.price ?? null,
      usd24hChange: ticker.quotes.USD?.percent_change_24h ?? null,
    };

    return accumulator;
  }, {});
}
