import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { renderSectionHeader } from "./renderSectionHeader";
import { renderTable } from "./renderTable";
import { PdfHeader } from "../components/PdfHeader";
import { PdfFooter } from "../components/PdfFooter";
import { HACCP_THEME as T } from "../theme";
import { ExportBlock, ExportDoc, ExportDocLabels, resolveExportText } from "../exportDoc";
import path from "path";

// REGISTER LOCAL FONTS
// We use absolute paths for Node.js environment stability (Vercel/Next.js API routes)
const fontsDir = path.join(process.cwd(), "public/fonts");

Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(fontsDir, "Roboto-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(fontsDir, "Roboto-Bold.ttf"), fontWeight: "bold" }
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

/* =========================================================
   DOCAPESCA-CLASSIC TEMPLATE COMPONENTS
   ========================================================= */

const DC = T.docapesca;
const DC_HEADER_HEIGHT = 36;
const DC_FOOTER_HEIGHT = 24;

const dcStyles = StyleSheet.create({
  /* Cover page */
  coverPage: {
    fontFamily: "Roboto",
    position: "relative",
  },
  ribbonDark: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DC.ribbonWidth,
    backgroundColor: DC.navyDark,
  },
  ribbonAccent: {
    position: "absolute",
    left: DC.ribbonWidth,
    top: 0,
    bottom: 0,
    width: DC.accentLineWidth,
    backgroundColor: DC.accentBlue,
  },
  coverLogo: {
    position: "absolute",
    top: 40,
    right: 40,
    width: 120,
    height: 60,
    objectFit: "contain" as any,
  },
  coverCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: DC.ribbonWidth + DC.accentLineWidth + 30,
    paddingRight: 40,
  },
  coverTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: DC.navyDark,
    letterSpacing: 1.5,
  },
  coverSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: T.colors.text,
    marginTop: 10,
  },
  coverMeta: {
    position: "absolute",
    bottom: 80,
    left: DC.ribbonWidth + DC.accentLineWidth + 30,
    right: 40,
  },
  coverMetaRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  coverMetaLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: DC.navyDark,
    width: 120,
  },
  coverMetaValue: {
    fontSize: 10,
    color: T.colors.text,
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: T.colors.border,
    paddingBottom: 2,
  },
  /* Content pages */
  contentPage: {
    paddingTop: 20 + DC_HEADER_HEIGHT + 14,
    paddingBottom: 20 + DC_FOOTER_HEIGHT + 10,
    paddingHorizontal: T.spacing.pagePadding,
    fontFamily: "Roboto",
    fontSize: T.font.body,
    color: T.colors.text,
  },
  /* Header */
  headerWrap: {
    position: "absolute",
    top: 16,
    left: T.spacing.pagePadding,
    right: T.spacing.pagePadding,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: DC.navyDark,
  },
  headerDate: {
    fontSize: 8,
    color: T.colors.muted,
  },
  headerRule: {
    height: 1.5,
    backgroundColor: DC.accentBlue,
  },
  /* Footer */
  footerWrap: {
    position: "absolute",
    bottom: 16,
    left: T.spacing.pagePadding,
    right: T.spacing.pagePadding,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: T.colors.muted,
  },
});

const DocapescaCoverPage = ({ doc }: { doc: ExportDoc }) => {
  const { labels } = doc.meta;
  return (
    <Page size="A4" style={dcStyles.coverPage}>
      <Watermark isPaid={doc.meta.isPaid} />
      {/* Left ribbon */}
      <View style={dcStyles.ribbonDark} />
      <View style={dcStyles.ribbonAccent} />

      {/* Top-right logo */}
      {doc.meta.logoDataUri && (
        <Image src={doc.meta.logoDataUri} style={dcStyles.coverLogo} />
      )}

      {/* Centered title */}
      <View style={dcStyles.coverCenter}>
        <Text style={dcStyles.coverTitle}>
          {labels.documentTitle.toUpperCase()}
        </Text>
        <Text style={dcStyles.coverSubtitle}>
          {doc.cover.pdf.subtitle || labels.subtitle}
        </Text>
      </View>

      {/* Bottom metadata */}
      <View style={dcStyles.coverMeta}>
        <View style={dcStyles.coverMetaRow}>
          <Text style={dcStyles.coverMetaLabel}>{labels.createdBy}:</Text>
          <Text style={dcStyles.coverMetaValue}>{"________________________________________"}</Text>
        </View>
        <View style={dcStyles.coverMetaRow}>
          <Text style={dcStyles.coverMetaLabel}>{labels.approvedBy}:</Text>
          <Text style={dcStyles.coverMetaValue}>{"________________________________________"}</Text>
        </View>
        <View style={dcStyles.coverMetaRow}>
          <Text style={dcStyles.coverMetaLabel}>{labels.date}:</Text>
          <Text style={dcStyles.coverMetaValue}>{doc.meta.generatedDate}</Text>
        </View>
        <View style={dcStyles.coverMetaRow}>
          <Text style={dcStyles.coverMetaLabel}>{labels.version}:</Text>
          <Text style={dcStyles.coverMetaValue}>{doc.meta.versionId}</Text>
        </View>
      </View>
    </Page>
  );
};

const DocapescaHeader = ({ doc }: { doc: ExportDoc }) => {
  const { labels } = doc.meta;
  return (
    <View fixed style={dcStyles.headerWrap}>
      <View style={dcStyles.headerRow}>
        <Text style={dcStyles.headerTitle}>{labels.documentTitle}</Text>
        <Text style={dcStyles.headerDate}>{doc.meta.generatedDate}</Text>
      </View>
      <View style={dcStyles.headerRule} />
    </View>
  );
};

const DocapescaFooter = ({ doc }: { doc: ExportDoc }) => {
  const { labels } = doc.meta;
  return (
    <View fixed style={dcStyles.footerWrap}>
      <Text style={dcStyles.footerText}>
        {labels.version}: {doc.meta.versionId}
      </Text>
      <Text
        style={dcStyles.footerText}
        render={({ pageNumber, totalPages }) =>
          `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`
        }
      />
    </View>
  );
};

/* =========================================================
   MAIN EXPORT COMPONENT
   ========================================================= */

export const HACCPDocumentModular = ({ doc }: { doc: ExportDoc }) => {
  const isDocapesca = doc.meta.template === "docapesca-classic";

  if (isDocapesca) {
    return (
      <Document>
        {/* DOCAPESCA COVER PAGE */}
        <DocapescaCoverPage doc={doc} />

        {/* DOCAPESCA CONTENT PAGES */}
        <Page size="A4" style={dcStyles.contentPage}>
          <Watermark isPaid={doc.meta.isPaid} />
          <DocapescaHeader doc={doc} />

          <View>
            {doc.content.map((block, index) => (
              <View key={index}>{renderBlock(block)}</View>
            ))}
          </View>

          <DocapescaFooter doc={doc} />
        </Page>
      </Document>
    );
  }

  /* DEFAULT template (unchanged) */
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
