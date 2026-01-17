import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

export const renderFooter = (theme: any, planVersion: number = 1) => {
  const styles = StyleSheet.create({
    footer: {
      position: 'absolute',
      bottom: 20,
      left: `${theme.spacing.margin}mm`,
      right: `${theme.spacing.margin}mm`,
      flexDirection: 'row',
      justifyContent: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 10,
    },
    text: {
      fontSize: theme.fonts.footer,
      color: theme.colors.muted || theme.colors.text,
    },
  });

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.text}>HACCP_CODEX v1.0.0 | Plan v{planVersion} | </Text>
      <Text style={styles.text} render={({ pageNumber, totalPages }) => ` Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
};