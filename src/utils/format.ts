const usdCurrency = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  style: 'currency',
});

const usdCompact = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 1,
  notation: 'compact',
  style: 'currency',
});

const compactNumber = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  if (Math.abs(value) > 0 && Math.abs(value) < 1) {
    return new Intl.NumberFormat('en-US', {
      currency: 'USD',
      maximumFractionDigits: value >= 0.01 ? 4 : 8,
      style: 'currency',
    }).format(value);
  }

  return usdCurrency.format(value);
}

export function formatCompactCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  if (Math.abs(value) < 1000) {
    return formatCurrency(value);
  }

  return usdCompact.format(value);
}

export function formatCompactNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  return compactNumber.format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatQuantity(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

export function formatUpdatedTime(timestamp: number | null | undefined) {
  if (!timestamp) {
    return 'Unknown';
  }

  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
