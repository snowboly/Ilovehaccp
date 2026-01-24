import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { HACCP_THEME as T } from "../theme";
import { wrapIdForPdf } from "../wrap";

const rowBase = {
  flexDirection: "row" as const,
  borderLeftWidth: T.borders.width,
  borderRightWidth: T.borders.width,
  borderColor: T.colors.border,
};

function normalizeCellValue(cell: React.ReactNode) {
  if (cell === null || cell === undefined || cell === "") {
    return "-";
  }
  if (React.isValidElement(cell)) {
    return cell;
  }
  if (typeof cell === "string") {
    return wrapIdForPdf(cell);
  }
  return wrapIdForPdf(String(cell));
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
      }}
    >
      {cells.map((cell, idx) => (
        <View
          key={idx}
          style={{
            flex: 1,
            padding: 6,
            width: colWidths[idx],
          }}
        >
          {cell}
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
        width: "auto",
        marginBottom: theme.spacing.sectionBottom,
        borderBottomWidth: T.borders.width,
        borderBottomColor: T.colors.border,
      }}
    >
      <TableRow
        cells={headers.map((header) => (
          <Text style={{ fontWeight: 700, fontSize: T.font.h2, color: T.colors.text }}>
            {header}
          </Text>
        ))}
        isHeader
        colWidths={colWidths}
      />
      {rows.map((row, rowIndex) => (
        <TableRow
          key={rowIndex}
          cells={row.map((cell) => (
            <Text style={{ fontSize: T.font.body, color: T.colors.text }}>
              {normalizeCellValue(cell)}
            </Text>
          ))}
          zebra={rowIndex % 2 === 1}
          colWidths={colWidths}
        />
      ))}
    </View>
  );
};
