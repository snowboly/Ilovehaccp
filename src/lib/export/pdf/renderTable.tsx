import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { HACCP_THEME as T } from "../theme";

const rowBase = {
  flexDirection: "row" as const,
  borderLeftWidth: T.borders.width,
  borderRightWidth: T.borders.width,
  borderColor: T.colors.border,
};

// Zero-width and invisible characters to remove
const INVISIBLE_CHARS_REGEX = /[\u200B\u200C\u200D\u00AD\uFEFF\u2060\u180E]/g;

// HELPER: Cell Sanitization
function formatCellValue(cell: unknown): string {
  if (cell === null || cell === undefined || cell === "") {
    return "-";
  }

  let str = "";
  if (typeof cell === "object") {
    try {
      str = JSON.stringify(cell, null, 2);
    } catch {
      str = String(cell);
    }
  } else {
    str = String(cell);
  }

  // 1. Remove invisible characters (zero-width spaces, soft hyphens, etc.)
  str = str.replace(INVISIBLE_CHARS_REGEX, "");

  // 2. Collapse whitespace
  str = str.replace(/[ \t]+/g, " ").trim();

  // 3. Truncate
  const MAX_LEN = typeof cell === 'object' ? 800 : 500;
  if (str.length > MAX_LEN) {
    str = str.substring(0, MAX_LEN) + "…";
  }

  // 4. Wrap long tokens (insert space every 24 chars for contiguous runs > 36)
  // This prevents "unbreakable" strings from forcing layout overflows
  str = str.replace(/(\S{36,})/g, (match) => {
    const parts: string[] = [];
    for (let i = 0; i < match.length; i += 24) {
      parts.push(match.slice(i, i + 24));
    }
    return parts.join(" ");
  });

  return str;
}

function TableRow({
  cells,
  isHeader,
  zebra,
  colWidths,
}: {
  cells: React.ReactNode[];
  isHeader?: boolean;
  zebra?: boolean;
  colWidths: string[];
}) {
  return (
    <View
      style={{
        ...rowBase,
        backgroundColor: isHeader
          ? T.colors.tableHeaderBg
          : zebra
          ? "#FAFBFD"
          : T.colors.white,
        borderTopWidth: T.borders.width,
        // LAYOUT FIX: Ensure row does not shrink contents
        flexWrap: 'wrap' 
      }}
    >
      {cells.map((cell, idx) => (
        <View
          key={idx}
          style={{
            // LAYOUT FIX: Remove flex: 1. Use pure width.
            width: colWidths[idx], 
            padding: 6,
            borderRightWidth: idx < cells.length - 1 ? 1 : 0, // Optional grid line
            borderColor: '#eee'
          }}
        >
          {/* Apply Sanitization Helper to Text Content */}
          {typeof cell === 'string' || typeof cell === 'number' || cell === null ? (
              <Text style={{ 
                  fontSize: isHeader ? T.font.h2 : T.font.body, 
                  color: T.colors.text,
                  fontWeight: isHeader ? 'bold' : 'normal'
              }}>
                {formatCellValue(cell)}
              </Text>
          ) : (
              // Passthrough for complex React Elements (if any)
              cell
          )}
        </View>
      ))}
    </View>
  );
}

export const renderTable = (
  headers: string[],
  rows: any[][], // eslint-disable-line @typescript-eslint/no-explicit-any
  colWidths: string[],
  theme: any // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  return (
    <View
      style={{
        display: "flex",
        width: "100%", // Explicit full width
        marginBottom: theme.spacing.sectionBottom,
        borderBottomWidth: T.borders.width,
        borderBottomColor: T.colors.border,
      }}
    >
      <TableRow
        cells={headers.map((header) => header)} // Passed as raw strings to be formatted inside
        isHeader
        colWidths={colWidths}
      />
      {rows.map((row, rowIndex) => (
        <TableRow
          key={rowIndex}
          cells={row.map((cell) => cell)} // Passed as raw values
          zebra={rowIndex % 2 === 1}
          colWidths={colWidths}
        />
      ))}
    </View>
  );
};