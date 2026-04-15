export interface CoinPaprikaGlobalResponse {
  bitcoin_dominance_percentage: number | null;
  cryptocurrencies_number: number;
  last_updated: number;
  market_cap_change_24h: number | null;
  market_cap_usd: number | null;
  volume_24h_usd: number | null;
}

export interface CoinPaprikaTickerQuoteUsd {
  market_cap?: number | null;
  market_cap_change_24h?: number | null;
  percent_change_24h?: number | null;
  percent_change_7d?: number | null;
  price?: number | null;
  volume_24h?: number | null;
}

export interface CoinPaprikaTickerResponse {
  circulating_supply?: number | null;
  id: string;
  last_updated: string | null;
  max_supply?: number | null;
  name: string;
  quotes: {
    USD?: CoinPaprikaTickerQuoteUsd;
  };
  rank: number | null;
  symbol: string;
  total_supply?: number | null;
}

export interface CoinPaprikaSearchCurrencyResponse {
  id: string;
  is_active: boolean;
  name: string;
  rank: number | null;
  symbol: string;
  type: string;
}

export interface CoinPaprikaSearchResponse {
  currencies?: CoinPaprikaSearchCurrencyResponse[];
}

export interface CoinPaprikaCoinResponse {
  description?: string | null;
  id: string;
  logo?: string | null;
  name: string;
  rank: number | null;
  symbol: string;
}

export interface CoinPaprikaOhlcvPointResponse {
  close: number | null;
  high: number | null;
  low: number | null;
  market_cap: number | null;
  open: number | null;
  time_close: string;
  time_open: string;
  volume: number | null;
}
