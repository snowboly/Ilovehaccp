import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { HACCP_THEME as T } from "../theme";

const rowBase = {
  flexDirection: "row" as const,
  borderLeftWidth: T.borders.width,
  borderRightWidth: T.borders.width,
  borderColor: T.colors.border,
};

// HELPER: Cell Sanitization
function formatCellValue(cell: unknown): string {
  if (cell === null || cell === undefined || cell === "") {
    return "-";
  }

  let str = "";
  if (typeof cell === "object") {
    try {
      str = JSON.stringify(cell, null, 2);
    } catch (e) {
      str = String(cell);
    }
  } else {
    str = String(cell);
  }

  // 1. Collapse whitespace
  str = str.replace(/\s+/g, " ").trim();

  // 2. Truncate
  const MAX_LEN = typeof cell === 'object' ? 800 : 500;
  if (str.length > MAX_LEN) {
    str = str.substring(0, MAX_LEN) + "…";
  }

  // 3. Wrap long tokens (insert space every 24 chars for runs > 36)
  // This prevents "unbreakable" strings from forcing layout overflows
  str = str.replace(/([^\s]{24})([^\s]{12,})/g, '$1 $2');

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
  rows: any[][],
  colWidths: string[],
  theme: any
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