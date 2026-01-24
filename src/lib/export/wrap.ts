// Inserts zero-width spaces so react-pdf can wrap long strings in narrow columns.
export function wrapIdForPdf(input: string, chunk = 8): string {
  if (!input) return "";
  // Prefer breaks after hyphens, plus chunk breaks for long unbroken text.
  const withHyphenBreaks = input.replace(/-/g, "-\u200b");
  const parts: string[] = [];
  for (let i = 0; i < withHyphenBreaks.length; i += chunk) {
    parts.push(withHyphenBreaks.slice(i, i + chunk));
  }
  return parts.join("\u200b");
}
