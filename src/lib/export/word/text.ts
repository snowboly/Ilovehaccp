const ZERO_WIDTH_CHARS = /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD]/g;
const MARKDOWN_LINK = /\[([^\]]+)\]\([^)]+\)/g;
const MARKDOWN_BOLD = /(\*\*|__)(.*?)\1/g;
const MARKDOWN_CODE = /`([^`]+)`/g;

const stringifyDocxValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map((item) => stringifyDocxValue(item)).filter(Boolean).join("; ");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => `${key}: ${stringifyDocxValue(val)}`)
      .filter((entry) => entry.trim() !== ":")
      .join("; ");
  }
  return String(value);
};

const normalizeJsonLikeText = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      const parsed = JSON.parse(trimmed);
      const normalized = stringifyDocxValue(parsed);
      return normalized || text;
    } catch {
      return text;
    }
  }
  return text;
};

const splitLongToken = (token: string, chunkSize: number) => {
  const segments: string[] = [];
  for (let i = 0; i < token.length; i += chunkSize) {
    segments.push(token.slice(i, i + chunkSize));
  }
  return segments.join(" ");
};

const insertSpacingForLongTokens = (text: string, maxTokenLength = 30, chunkSize = 18) => {
  return text
    .split(/\s+/)
    .map((token) => (token.length > maxTokenLength ? splitLongToken(token, chunkSize) : token))
    .join(" ");
};

export const sanitizeDocxText = (input: string) => {
  const trimmed = input?.toString() ?? "";
  const withoutInvisible = trimmed.replace(ZERO_WIDTH_CHARS, "");
  const withoutMarkdown = withoutInvisible
    .replace(MARKDOWN_LINK, "$1")
    .replace(MARKDOWN_BOLD, "$2")
    .replace(MARKDOWN_CODE, "$1");
  const normalized = normalizeJsonLikeText(withoutMarkdown);
  return insertSpacingForLongTokens(normalized.replace(/\s+/g, " ").trim());
};
