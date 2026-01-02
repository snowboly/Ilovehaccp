import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#333333',
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A', // Blue-900
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  headerRight: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'right',
  },

  // Cover Page
  coverPage: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: 40,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  coverBox: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E3A8A',
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  coverMetaContainer: {
    marginTop: 20,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  coverMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coverLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  coverValue: {
    fontSize: 10,
    color: '#111827',
  },

  // Content
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#111827',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
  },
  subHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
    color: '#374151',
  },
  text: {
    marginBottom: 6,
    textAlign: 'justify',
    fontSize: 9,
  },
  
  // Tables
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // Lighter gray
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 25,
    alignItems: 'center',
  },
  tableColHeader: {
    padding: 6,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableCol: {
    padding: 6,
    fontSize: 8,
    color: '#4B5563',
  },
  
  // Badges
  ccpBadge: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
    fontSize: 7,
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: '#9CA3AF',
  },

  // Signature Block
  signatureBlock: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6B7280',
  }
});

interface Props {
  data: {
    businessName: string;
    productName: string;
    productDescription: string;
    intendedUse: string;
    storageType: string;
    analysis: any[];
    fullPlan?: {
      executive_summary: string;
      prerequisite_programs: { program: string; details: string }[];
      process_flow_narrative: string;
      hazard_analysis: any[];
      ccp_summary: {
        ccp_step: string;
        hazard: string;
        critical_limit: string;
        monitoring: string;
        corrective_action: string;
      }[];
    } | null;
  };
}

const CommonHeader = ({ title }: { title: string }) => (
  <View style={styles.headerContainer} fixed>
    <View style={styles.headerLeft}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSubtitle}>Food Safety Management System</Text>
    </View>
    <View style={styles.headerRight}>
      <Text>CONFIDENTIAL</Text>
      <Text>Version 1.0</Text>
    </View>
  </View>
);

const CommonFooter = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>Generated by ilovehaccp.com - AI Food Safety</Text>
    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

const HACCPDocument = ({ data }: Props) => {
  const { fullPlan } = data;
  const today = new Date().toLocaleDateString();

  return (
    <Document>
      {/* PAGE 1: COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverBox}>
          <Text style={styles.coverTitle}>HACCP PLAN</Text>
          <Text style={styles.coverSubtitle}>Food Safety Management System</Text>
          
          <View style={{ width: '100%', height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 }} />

          <View style={styles.coverMetaContainer}>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverLabel}>Facility Name:</Text>
              <Text style={{ ...styles.coverValue, fontWeight: 'bold' }}>{data.businessName}</Text>
            </View>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverLabel}>Product Scope:</Text>
              <Text style={styles.coverValue}>{data.productName}</Text>
            </View>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverLabel}>Date of Issue:</Text>
              <Text style={styles.coverValue}>{today}</Text>
            </View>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverLabel}>Standard:</Text>
              <Text style={styles.coverValue}>Codex Alimentarius / FDA 21 CFR</Text>
            </View>
          </View>
        </View>
        
        <View style={{ position: 'absolute', bottom: 40 }}>
            <Text style={{ fontSize: 8, color: '#9CA3AF' }}>This document is a generated draft and must be validated by a qualified professional.</Text>
        </View>
      </Page>

      {/* PAGE 2: PLAN OVERVIEW */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={data.businessName} />
        
        <Text style={styles.sectionTitle}>1.0 Plan Overview</Text>
        
        <View style={{ marginBottom: 15 }}>
            <Text style={styles.subHeader}>1.1 Executive Summary</Text>
            <Text style={styles.text}>
            {fullPlan?.executive_summary || "This HACCP plan outlines the systematic approach to controlling food safety hazards."}
            </Text>
        </View>

        <View style={{ marginBottom: 15 }}>
            <Text style={styles.subHeader}>1.2 Product Description</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 5, backgroundColor: '#F9FAFB' }}><Text style={styles.coverLabel}>Product Name</Text></View>
                    <View style={{ width: '70%', padding: 5 }}><Text style={styles.text}>{data.productName}</Text></View>
                </View>
                <View style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 5, backgroundColor: '#F9FAFB' }}><Text style={styles.coverLabel}>Description</Text></View>
                    <View style={{ width: '70%', padding: 5 }}><Text style={styles.text}>{data.productDescription}</Text></View>
                </View>
                <View style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 5, backgroundColor: '#F9FAFB' }}><Text style={styles.coverLabel}>Intended Use</Text></View>
                    <View style={{ width: '70%', padding: 5 }}><Text style={styles.text}>{data.intendedUse}</Text></View>
                </View>
                <View style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 5, backgroundColor: '#F9FAFB' }}><Text style={styles.coverLabel}>Storage</Text></View>
                    <View style={{ width: '70%', padding: 5 }}><Text style={styles.text}>{data.storageType}</Text></View>
                </View>
            </View>
        </View>

        <View style={{ marginBottom: 15 }}>
            <Text style={styles.subHeader}>1.3 Process Narrative</Text>
            <Text style={styles.text}>
            {fullPlan?.process_flow_narrative || "Process follows standard flow: Receiving -> Storage -> Prep -> Cook -> Service."}
            </Text>
        </View>

        <CommonFooter />
      </Page>

      {/* PAGE 3: PREREQUISITE PROGRAMS */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={data.businessName} />
        
        <Text style={styles.sectionTitle}>2.0 Prerequisite Programs (PRPs)</Text>
        <Text style={{ ...styles.text, marginBottom: 10 }}>
            Foundation programs in place to control general hygiene hazards.
        </Text>

        <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
                <View style={{ width: '30%', padding: 6 }}><Text style={styles.tableColHeader}>Program</Text></View>
                <View style={{ width: '70%', padding: 6 }}><Text style={styles.tableColHeader}>Details & Control</Text></View>
            </View>
            {fullPlan?.prerequisite_programs?.map((prp, index) => (
                <View key={index} style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 6 }}><Text style={{...styles.text, fontWeight: 'bold'}}>{prp.program}</Text></View>
                    <View style={{ width: '70%', padding: 6 }}><Text style={styles.text}>{prp.details}</Text></View>
                </View>
            ))}
        </View>

        <CommonFooter />
      </Page>

      {/* PAGE 4: HAZARD ANALYSIS */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={data.businessName} />
        
        <Text style={styles.sectionTitle}>3.0 Hazard Analysis (Principle 1 & 2)</Text>
        
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>Step</Text></View>
            <View style={{ ...styles.tableColHeader, width: '35%' }}><Text>Hazards (B/C/P)</Text></View>
            <View style={{ ...styles.tableColHeader, width: '35%' }}><Text>Control Measure</Text></View>
            <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>CCP?</Text></View>
          </View>

          {data.analysis.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '15%' }}><Text style={{fontWeight: 'bold'}}>{item.step_name}</Text></View>
              <View style={{ ...styles.tableCol, width: '35%' }}><Text>{item.hazards}</Text></View>
              <View style={{ ...styles.tableCol, width: '35%' }}><Text>{item.control_measure}</Text></View>
              <View style={{ ...styles.tableCol, width: '15%', alignItems: 'center' }}>
                {item.is_ccp ? (
                  <Text style={styles.ccpBadge}>CCP</Text>
                ) : (
                  <Text style={{fontSize: 8, color: '#9CA3AF'}}>Prerequisite</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <CommonFooter />
      </Page>

      {/* PAGE 5: HACCP PLAN SUMMARY */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={data.businessName} />
        
        <Text style={styles.sectionTitle}>4.0 HACCP Control Chart (Principles 3-7)</Text>
        <Text style={{ ...styles.text, marginBottom: 15 }}>
          Detailed control plan for identified Critical Control Points.
        </Text>

        {fullPlan?.ccp_summary && fullPlan.ccp_summary.length > 0 ? (
          fullPlan.ccp_summary.map((ccp, index) => (
            <View key={index} style={{ marginBottom: 20, borderWidth: 1, borderColor: '#1E3A8A', borderRadius: 4 }}>
              {/* CCP Header */}
              <View style={{ backgroundColor: '#1E3A8A', padding: 5 }}>
                 <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>{ccp.ccp_step}</Text>
              </View>
              
              <View style={{ padding: 10 }}>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#B91C1C' }}>SIGNIFICANT HAZARD:</Text>
                    <Text style={styles.text}>{ccp.hazard}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 }}>
                    <View style={{ width: '33%', paddingRight: 10 }}>
                        <Text style={styles.subHeader}>Critical Limit</Text>
                        <Text style={styles.text}>{ccp.critical_limit}</Text>
                    </View>
                    <View style={{ width: '33%', paddingRight: 10, borderLeftWidth: 1, borderLeftColor: '#E5E7EB', paddingLeft: 10 }}>
                        <Text style={styles.subHeader}>Monitoring</Text>
                        <Text style={styles.text}>{ccp.monitoring}</Text>
                    </View>
                    <View style={{ width: '33%', paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}>
                        <Text style={styles.subHeader}>Corrective Action</Text>
                        <Text style={styles.text}>{ccp.corrective_action}</Text>
                    </View>
                  </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: 20, backgroundColor: '#F3F4F6', borderRadius: 4, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280' }}>
              No Critical Control Points (CCPs) identified. Process is controlled via PRPs.
            </Text>
          </View>
        )}

        <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}>
                <Text style={styles.signatureLabel}>Prepared By (HACCP Team Leader)</Text>
            </View>
            <View style={styles.signatureLine}>
                <Text style={styles.signatureLabel}>Approved By (Management)</Text>
            </View>
        </View>

        <CommonFooter />
      </Page>
    </Document>
  );
};

export default HACCPDocument;