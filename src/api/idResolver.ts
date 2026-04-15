import { request } from '@/api/client';
import {
  type CoinPaprikaSearchCurrencyResponse,
  type CoinPaprikaSearchResponse,
  type CoinPaprikaTickerResponse,
} from '@/api/types';
import { SEARCH_RESULT_LIMIT } from '@/constants/app';

interface ResolveHints {
  name?: string;
  symbol?: string;
}

const STATIC_ID_MAP: Record<string, string> = {
  bitcoin: 'btc-bitcoin',
  binancecoin: 'bnb-binance-coin',
  cardano: 'ada-cardano',
  chainlink: 'link-chainlink',
  dogecoin: 'doge-dogecoin',
  ethereum: 'eth-ethereum',
  litecoin: 'ltc-litecoin',
  polkadot: 'dot-polkadot',
  ripple: 'xrp-xrp',
  solana: 'sol-solana',
  tether: 'usdt-tether',
  tron: 'trx-tron',
  'usd-coin': 'usdc-usd-coin',
  uniswap: 'uni-uniswap',
};

const idCache = new Map<string, string>();
const notFoundCache = new Set<string>();

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function slugify(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function scoreCandidate(
  candidate: CoinPaprikaSearchCurrencyResponse,
  legacyId: string,
  hints: ResolveHints,
) {
  let score = 50;
  const normalizedLegacyId = normalize(legacyId);
  const legacySlug = slugify(legacyId);
  const candidateId = normalize(candidate.id);
  const candidateNameSlug = slugify(candidate.name);
  const candidateSymbol = normalize(candidate.symbol);
  const hintNameSlug = hints.name ? slugify(hints.name) : null;
  const hintSymbol = hints.symbol ? normalize(hints.symbol) : null;

  if (candidateId === normalizedLegacyId) {
    score -= 200;
  }

  if (candidateId.endsWith(`-${legacySlug}`)) {
    score -= 120;
  }

  if (hintNameSlug && candidateNameSlug === hintNameSlug) {
    score -= 120;
  }

  if (candidateNameSlug === legacySlug) {
    score -= 100;
  }

  if (hintSymbol && candidateSymbol === hintSymbol) {
    score -= 90;
  }

  if (candidateNameSlug.includes(legacySlug) || legacySlug.includes(candidateNameSlug)) {
    score -= 20;
  }

  if (candidate.rank !== null && Number.isFinite(candidate.rank)) {
    score += candidate.rank / 1000;
  } else {
    score += 200;
  }

  return score;
}

async function validateTickerId(id: string) {
  await request<CoinPaprikaTickerResponse>(`/tickers/${id}`);
  return id;
}

async function resolveViaSearch(legacyId: string, hints: ResolveHints) {
  const terms = [legacyId, hints.name, hints.symbol]
    .filter((term): term is string => Boolean(term?.trim()))
    .map((term) => term.trim());

  const candidates = new Map<string, CoinPaprikaSearchCurrencyResponse>();

  await Promise.all(
    terms.map(async (term) => {
      const response = await request<CoinPaprikaSearchResponse>('/search', {
        c: 'currencies',
        limit: SEARCH_RESULT_LIMIT,
        q: term,
      });

      for (const candidate of response.currencies ?? []) {
        if (!candidate.is_active) {
          continue;
        }
        candidates.set(candidate.id, candidate);
      }
    }),
  );

  if (candidates.size === 0) {
    return null;
  }

  const best = [...candidates.values()].sort(
    (left, right) =>
      scoreCandidate(left, legacyId, hints) - scoreCandidate(right, legacyId, hints),
  )[0];

  return best?.id ?? null;
}

export async function resolveCoinPaprikaId(
  legacyId: string,
  hints: ResolveHints = {},
): Promise<string | null> {
  const normalizedLegacyId = normalize(legacyId);

  if (!normalizedLegacyId) {
    return null;
  }

  if (idCache.has(normalizedLegacyId)) {
    return idCache.get(normalizedLegacyId) ?? null;
  }

  if (notFoundCache.has(normalizedLegacyId)) {
    return null;
  }

  const staticMatch = STATIC_ID_MAP[normalizedLegacyId];
  if (staticMatch) {
    idCache.set(normalizedLegacyId, staticMatch);
    return staticMatch;
  }

  try {
    const validatedId = await validateTickerId(normalizedLegacyId);
    idCache.set(normalizedLegacyId, validatedId);
    return validatedId;
  } catch {
    // Continue with search heuristics.
  }

  try {
    const resolvedId = await resolveViaSearch(normalizedLegacyId, hints);
    if (resolvedId) {
      idCache.set(normalizedLegacyId, resolvedId);
      return resolvedId;
    }
  } catch {
    // Ignore resolver errors and let callers continue with the original id.
  }

  notFoundCache.add(normalizedLegacyId);
  return null;
}

export async function resolveCoinPaprikaIds(
  ids: string[],
  hintsById: Record<string, ResolveHints> = {},
) {
  const uniqueIds = [...new Set(ids)];
  const mappings = await Promise.all(
    uniqueIds.map(async (id) => {
      const resolved = await resolveCoinPaprikaId(id, hintsById[id] ?? {});
      return [id, resolved] as const;
    }),
  );

  return mappings.reduce<Record<string, string>>((accumulator, [legacyId, resolvedId]) => {
    accumulator[legacyId] = resolvedId ?? legacyId;
    return accumulator;
  }, {});
}

export function applyCoinIdMapping(ids: string[], mapping: Record<string, string>) {
  const deduped = new Set<string>();

  for (const id of ids) {
    deduped.add(mapping[id] ?? id);
  }

  return [...deduped];
}
