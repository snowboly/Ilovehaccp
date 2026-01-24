import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { HACCP_THEME as T } from "../theme";

export function SectionBand({ title }: { title: string }) {
  return (
    <View
      style={{
        backgroundColor: T.colors.lightBg,
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginTop: 12,
        marginBottom: 8,
        borderWidth: T.borders.width,
        borderColor: T.colors.border,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: 700, color: T.colors.primary }}>
        {title}
      </Text>
    </View>
  );
}

export const renderSectionHeader = (text: string) => {
  return <SectionBand title={text} />;
};
