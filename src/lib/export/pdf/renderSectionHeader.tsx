import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

export const renderSectionHeader = (text: string, theme: any) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.sectionBg,
      paddingVertical: 7,
      paddingHorizontal: 10,
      marginBottom: theme.spacing.sectionBottom,
      marginTop: theme.spacing.sectionTop,
      width: '100%',
      ...(theme.radius?.section ? { borderRadius: theme.radius.section } : {}),
      borderLeftWidth: theme.id === 'professional-modern' ? 4 : 0,
    },
    text: {
      fontSize: theme.fonts.section,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: theme.id === 'professional-modern' ? theme.colors.primary : theme.colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};
