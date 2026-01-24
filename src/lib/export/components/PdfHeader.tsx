import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { HACCP_THEME as T } from "../theme";
import { wrapIdForPdf } from "../wrap";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    width: "100%",
    borderBottomWidth: T.borders.width,
    borderBottomColor: T.colors.border,
    paddingBottom: T.spacing.gapSm,
    marginBottom: T.spacing.gapMd,
  },

  colLeft: { width: "60%", paddingRight: 8 },
  colCenter: { width: "20%", alignItems: "center", justifyContent: "center" },
  colRight: { width: "20%", paddingLeft: 8 },

  title: { fontSize: 14, fontWeight: 700, color: T.colors.text },
  subtitle: { fontSize: 9, color: T.colors.muted, marginTop: 2 },

  logoBox: {
    height: 28,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { height: 28, objectFit: "contain" },

  versionBox: {
    borderWidth: T.borders.width,
    borderColor: T.colors.border,
    backgroundColor: T.colors.tableHeaderBg,
    padding: 6,
  },
  versionRow: { flexDirection: "row", width: "100%" },
  versionLabel: { width: "45%", fontSize: 8, color: T.colors.muted },
  versionValue: {
    width: "55%",
    fontSize: 8,
    color: T.colors.text,
  },
});

export function PdfHeader(props: {
  logoDataUri?: string;
  versionId: string;
  generatedDate: string;
}) {
  const { logoDataUri, versionId, generatedDate } = props;

  return (
    <View style={styles.header} fixed>
      <View style={styles.colLeft}>
        <Text style={styles.title}>HACCP PLAN – DRAFT</Text>
        <Text style={styles.subtitle}>Generated HACCP Documentation</Text>
      </View>

      <View style={styles.colCenter}>
        <View style={styles.logoBox}>
          {logoDataUri ? <Image style={styles.logo} src={logoDataUri} /> : null}
        </View>
      </View>

      <View style={styles.colRight}>
        <View style={styles.versionBox}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Version</Text>
            <Text style={styles.versionValue}>{wrapIdForPdf(versionId)}</Text>
          </View>
          <View style={{ height: 4 }} />
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Generated</Text>
            <Text style={styles.versionValue}>{generatedDate}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
