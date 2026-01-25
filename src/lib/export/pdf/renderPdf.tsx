import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { renderSectionHeader } from "./renderSectionHeader";
import { renderTable } from "./renderTable";
import { PdfHeader } from "../components/PdfHeader";
import { PdfFooter } from "../components/PdfFooter";
import { HACCP_THEME as T } from "../theme";
import { ExportBlock, ExportDoc, resolveExportText } from "../exportDoc";

// IMPORT LOCAL FONTS
import fontRegular from "./fonts/Roboto-Regular.ttf";
import fontBold from "./fonts/Roboto-Bold.ttf";

// REGISTER LOCAL FONTS
Font.register({
  family: "Roboto",
  fonts: [
    { src: fontRegular, fontWeight: "normal" },
    { src: fontBold, fontWeight: "bold" }
  ]
});

const Watermark = ({ isPaid }: { isPaid: boolean }) => {
  if (isPaid) return null;
  
  const styles = StyleSheet.create({
    watermark: {
      position: 'absolute',
      top: 300,
      left: 100,
      width: 400,
      height: 400,
      transform: 'rotate(-45deg)',
      opacity: 0.1,
      zIndex: -1
    },
    text: {
      fontSize: 60,
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'center'
    }
  });

  return (
    <View style={styles.watermark} fixed>
      <Text style={styles.text}>iLoveHACCP</Text>
      <Text style={styles.text}>Free Edition</Text>
    </View>
  );
};

const renderBlock = (block: ExportBlock) => {
  switch (block.type) {
    case "section":
      return renderSectionHeader(resolveExportText(block.title, "pdf"));
    case "paragraph":
      return (
        <Text
          style={{
            marginBottom: T.spacing.gapMd,
            fontSize: T.font.body,
            color: block.muted ? T.colors.muted : T.colors.text,
            fontStyle: block.italic ? "italic" : "normal",
          }}
        >
          {resolveExportText(block.text, "pdf")}
        </Text>
      );
    case "table":
      return renderTable(
        block.headers.map((header) => resolveExportText(header, "pdf")),
        block.rows.map((row) => row.map((cell) => resolveExportText(cell, "pdf"))),
        block.colWidths.map((width) => `${width}%`),
        { spacing: { sectionBottom: T.spacing.gapMd } }
      );
    case "subheading":
      return (
        <Text style={{ fontWeight: "bold", marginBottom: 5, color: T.colors.primary }}>
          {resolveExportText(block.text, "pdf")}
        </Text>
      );
    case "signature":
      return (
        <View style={styles.signatureRow}>
          <View style={styles.signatureLine}>
            <Text>{resolveExportText(block.left, "pdf")}: ________________</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>{resolveExportText(block.right, "pdf")}: ________________</Text>
          </View>
        </View>
      );
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 80, // Header space
    paddingBottom: 60, // Footer space
    paddingHorizontal: T.spacing.pagePadding,
    fontFamily: "Roboto",
    fontSize: T.font.body,
    color: T.colors.text,
  },
  coverPage: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: T.spacing.pagePadding,
    fontFamily: "Roboto",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: T.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: T.colors.text,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
    borderBottomWidth: T.borders.width,
    borderBottomColor: T.colors.border,
    paddingBottom: 2,
  },
  label: { fontWeight: "bold" },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    objectFit: "contain",
  },
  body: {
    marginTop: 40,
  },
  signatureRow: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: T.colors.text,
    paddingTop: 5,
  },
});

export const HACCPDocumentModular = ({ doc }: { doc: ExportDoc }) => {
  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <Watermark isPaid={doc.meta.isPaid} />
        {doc.meta.logoDataUri && <Image src={doc.meta.logoDataUri} style={styles.logo} />}
        <Text style={styles.title}>{doc.cover.pdf.title}</Text>
        <Text style={styles.subtitle}>{doc.cover.pdf.subtitle}</Text>
        
        <View style={{ width: "100%", marginTop: 20 }}>
            {doc.cover.pdf.metaRows.map((m, i) => (
                <View key={i} style={styles.metaRow}>
                    <Text style={styles.label}>{m.label}:</Text>
                    <Text>{m.value}</Text>
                </View>
            ))}
        </View>
      </Page>

      {/* CONTENT PAGES */}
      <Page size="A4" style={styles.page}>
        <Watermark isPaid={doc.meta.isPaid} />
        
        {/* HEADER: Fixed & Absolute to ensure repetition */}
        <View fixed style={{ position: 'absolute', top: 20, left: 0, right: 0, paddingHorizontal: T.spacing.pagePadding }}>
            <PdfHeader
              logoDataUri={doc.meta.logoDataUri ?? undefined}
              versionId={doc.meta.versionId}
              generatedDate={doc.meta.generatedDate}
            />
        </View>

        <View style={styles.body}>
          {doc.content.map((block, index) => (
            <View key={index}>{renderBlock(block)}</View>
          ))}
        </View>

        {/* FOOTER: Fixed & Absolute */}
        <View fixed style={{ position: 'absolute', bottom: 20, left: 0, right: 0, paddingHorizontal: T.spacing.pagePadding }}>
            <PdfFooter />
        </View>
      </Page>
    </Document>
  );
};