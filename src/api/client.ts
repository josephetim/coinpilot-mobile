import { COINPAPRIKA_BASE_URL } from '@/constants/app';

type QueryParams = Record<
  string,
  boolean | null | number | string | string[] | undefined
>;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}

export function buildUrl(path: string, params?: QueryParams) {
  const normalizedBase = COINPAPRIKA_BASE_URL.endsWith('/')
    ? COINPAPRIKA_BASE_URL
    : `${COINPAPRIKA_BASE_URL}/`;

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  const url = new URL(normalizedPath, normalizedBase);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          url.searchParams.append(key, String(item));
        });
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url;
}

export async function request<T>(path: string, params?: QueryParams): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(buildUrl(path, params), {
      headers: {
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = 'Request failed';
      let code: string | undefined;

      try {
        const errorBody = (await response.json()) as {
          code?: string;
          error?: string;
          message?: string;
          status?: {
            error_code?: string;
            error_message?: string;
          };
        };

        message =
          errorBody.status?.error_message ??
          errorBody.message ??
          errorBody.error ??
          response.statusText ??
          message;
        code = errorBody.status?.error_code ?? errorBody.code;
      } catch {
        message = response.statusText || message;
      }

      if (response.status === 429) {
        message =
          'CoinPaprika rate limit reached. Last cached data remains available when present.';
      }

      throw new ApiError(message, response.status, code);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.', 408);
    }

    throw new ApiError('Network request failed. Check your connection and retry.', 0);
  } finally {
    clearTimeout(timeout);
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}
