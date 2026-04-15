import { decode } from 'html-entities';

export function stripHtmlTags(input: string) {
  return input.replace(/<[^>]*>/g, ' ');
}

export function toPlainTextSummary(input?: string | null, maxLength = 420) {
  if (!input) {
    return null;
  }

  const normalized = decode(stripHtmlTags(input))
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}
