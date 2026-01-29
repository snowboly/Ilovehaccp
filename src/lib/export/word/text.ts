const ZERO_WIDTH_CHARS = /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD]/g;
const MARKDOWN_LINK = /\[([^\]]+)\]\([^)]+\)/g;
const MARKDOWN_BOLD = /(\*\*|__)(.*?)\1/g;
const MARKDOWN_ITALIC = /(\*|_)([^*_]+)\1/g;
const MARKDOWN_CODE = /`([^`]+)`/g;
const HTML_ENTITY_NBSP = /&nbsp;/gi;
const HTML_TAGS = /<[^>]+>/g;
const XML_DECLARATION = /<\?xml[\s\S]*?\?>/gi;
// XML 1.0 invalid control characters (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F)
// Tab (0x09), Newline (0x0A), Carriage return (0x0D) are allowed
const XML_INVALID_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;


const splitLongToken = (token: string, chunkSize: number) => {
  const segments: string[] = [];
  for (let i = 0; i < token.length; i += chunkSize) {
    segments.push(token.slice(i, i + chunkSize));
  }
  return segments.join(" ");
};

const insertSpacingForLongTokens = (text: string, maxTokenLength = 30, chunkSize = 30) => {
  return text
    .split(/\s+/)
    .map((token) => (token.length > maxTokenLength ? splitLongToken(token, chunkSize) : token))
    .join(" ");
};

export const sanitizeDocxText = (input: string) => {
  const trimmed = input?.toString() ?? "";
  // Remove XML-invalid control characters first (critical for DOCX validity)
  const withoutXmlInvalid = trimmed.replace(XML_INVALID_CHARS, "");
  const withoutInvisible = withoutXmlInvalid.replace(ZERO_WIDTH_CHARS, "");
  const withoutMarkup = withoutInvisible
    .replace(XML_DECLARATION, "")
    .replace(HTML_TAGS, " ")
    .replace(HTML_ENTITY_NBSP, " ");
  const result = insertSpacingForLongTokens(
    withoutMarkup
      .replace(MARKDOWN_LINK, "$1")
      .replace(MARKDOWN_BOLD, "$2")
      .replace(MARKDOWN_ITALIC, "$2")
      .replace(MARKDOWN_CODE, "$1")
      .replace(/\s+/g, " ")
      .trim()
  );
  // Return at least a space for empty strings to prevent docx issues
  return result || " ";
};
