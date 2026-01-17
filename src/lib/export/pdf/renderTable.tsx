import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

export const renderTable = (headers: string[], rows: any[][], colWidths: string[], theme: any) => {
  const styles = StyleSheet.create({
    table: {
      display: 'flex',
      width: 'auto',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sectionBottom,
      ...(theme.radius?.table ? { borderRadius: theme.radius.table } : {}),
    },
    headerRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.tableHeaderBg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      minHeight: 20,
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      minHeight: 20,
      alignItems: 'center',
    },
    cell: {
      padding: theme.spacing.tablePadding || 6,
      fontSize: theme.fonts.tableBody,
      color: theme.colors.text,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    headerText: {
      fontWeight: 'bold',
      fontSize: theme.fonts.tableHeader,
      color: theme.id === 'professional-modern' ? theme.colors.primary : '#000000',
    }
  });

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.headerRow}>
        {headers.map((h, i) => (
          <View key={i} style={{ ...styles.cell, width: colWidths[i], borderRightWidth: i === headers.length - 1 ? 0 : 1 }}>
            <Text style={styles.headerText}>{h}</Text>
          </View>
        ))}
      </View>
      {/* Rows */}
      {rows.map((row, i) => (
        <View key={i} style={{ ...styles.row, borderBottomWidth: i === rows.length - 1 ? 0 : 1 }}>
          {row.map((cell, j) => (
            <View key={j} style={{ ...styles.cell, width: colWidths[j], borderRightWidth: j === row.length - 1 ? 0 : 1 }}>
              <Text>{cell || '-'}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
