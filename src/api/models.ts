export interface GlobalOverview {
  activeCryptocurrencies: number;
  btcDominance: number | null;
  marketCapChange24h: number | null;
  markets: number;
  totalMarketCapUsd: number | null;
  totalVolumeUsd: number | null;
  updatedAt: number;
}

export interface MarketCoin {
  currentPrice: number | null;
  id: string;
  image: string;
  lastUpdated: string | null;
  marketCap: number | null;
  marketCapRank: number | null;
  name: string;
  priceChange24h: number | null;
  priceChangePercentage24h: number | null;
  sparkline: number[];
  symbol: string;
  totalVolume: number | null;
}

export interface TrendingCoin {
  id: string;
  image: string;
  marketCapRank: number | null;
  name: string;
  price: number | null;
  priceChangePercentage24h: number | null;
  summary: string | null;
  symbol: string;
}

export interface SearchCoin {
  id: string;
  image: string;
  marketCapRank: number | null;
  name: string;
  symbol: string;
}

export interface CoinDetail {
  circulatingSupply: number | null;
  currentPrice: number | null;
  high24h: number | null;
  id: string;
  image: string;
  low24h: number | null;
  marketCap: number | null;
  marketCapRank: number | null;
  name: string;
  priceChange24h: number | null;
  priceChangePercentage24h: number | null;
  sparkline: number[];
  summary: string | null;
  symbol: string;
  totalSupply: number | null;
  totalVolume: number | null;
  maxSupply: number | null;
}

export interface SimplePricePoint {
  id: string;
  lastUpdatedAt: number | null;
  usd: number | null;
  usd24hChange: number | null;
}
