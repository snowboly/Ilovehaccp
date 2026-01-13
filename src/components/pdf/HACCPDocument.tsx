/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register font that supports accents
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Roboto',
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
  logo?: string | null;
  template?: string;
  data: {
    businessName: string;
    productName: string;
    productDescription: string;
    intendedUse: string;
    storageType: string;
    analysis: any[];
    fullPlan?: {
      executive_summary: string;
      benchmarking?: {
        score: number;
        industry_avg: number;
        analysis_summary: string;
        recommendations: { title: string; impact: string; desc: string }[];
      };
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
  dict: any; // The locale dictionary for PDF
}

const CommonHeader = ({ title, dict, logo, theme }: { title: string, dict: any, logo?: string | null, theme?: any }) => (
  <View style={{ ...styles.headerContainer, borderBottomColor: theme?.primary || '#1E3A8A' }} fixed>
    <View style={styles.headerLeft}>
      <Text style={{ ...styles.headerTitle, color: theme?.primary || '#1E3A8A' }}>{title}</Text>
      <Text style={styles.headerSubtitle}>{dict.subtitle}</Text>
    </View>
    <View style={styles.headerRight}>
      {logo && <Image src={logo} style={{ width: 30, height: 30, objectFit: 'contain', marginBottom: 5 }} />}
      <Text>{dict.confidential}</Text>
      <Text>{dict.version}</Text>
    </View>
  </View>
);

const CommonFooter = ({ dict }: { dict: any }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>{dict.generated_by}</Text>
    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

const HACCPDocument = ({ data, dict, logo, template = 'Minimal' }: Props) => {
  const { fullPlan } = data;
  const today = new Date().toLocaleDateString();

  // Template Theme Config
  const theme = {
    primary: template === 'Corporate' ? '#1E3A8A' : template === 'Modern' ? '#059669' : '#333333', // Blue-900, Emerald-600, Dark Gray
    secondary: template === 'Corporate' ? '#F3F4F6' : template === 'Modern' ? '#ECFDF5' : '#FFFFFF',
    accent: template === 'Corporate' ? '#B91C1C' : template === 'Modern' ? '#D97706' : '#000000',
    headerBg: template === 'Corporate' ? '#1E3A8A' : template === 'Modern' ? '#059669' : '#FFFFFF',
    headerText: template === 'Minimal' ? '#1E3A8A' : '#FFFFFF',
  };

  return (
    <Document>
      {/* PAGE 1: COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverBox}>
          {logo && (
            <Image 
                src={logo} 
                style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 20 }} 
            />
          )}
          
          <Text style={{...styles.coverTitle, color: theme.primary}}>{dict.title}</Text>
          <Text style={styles.coverSubtitle}>{dict.subtitle}</Text>
          
          <View style={{ width: '100%', height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 }} />

          <View style={styles.coverMetaContainer}>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverLabel}>{dict.facility}:</Text>
              <Text style={{ ...styles.coverValue, fontWeight: 'bold' }}>{data.businessName}</Text>
            </View>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverLabel}>{dict.product_scope}:</Text>
              <Text style={styles.coverValue}>{data.productName}</Text>
            </View>
            <View style={styles.coverMetaRow}>
              <Text style={styles.coverLabel}>{dict.date_issue}:</Text>
              <Text style={styles.coverValue}>{today}</Text>
            </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverLabel}>{dict.standard}</Text>
            <Text style={styles.coverValue}>EC Regulation 852/2004 / Codex</Text>
          </View>
        </View>
        </View>
        
        <View style={{ position: 'absolute', bottom: 40 }}>
            <Text style={{ fontSize: 8, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 }}>
              This document is a generated draft based on provided inputs. It is designed for guidance only and does not constitute a legal certification. 
              The operator is solely responsible for validating all critical limits, hazards, and procedures against local regulations before operational use.
            </Text>
        </View>
      </Page>

      {/* PAGE 2: PLAN OVERVIEW */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={data.businessName} dict={dict} logo={logo} theme={theme} />
        
        <Text style={{ ...styles.sectionTitle, borderLeftColor: theme.primary, color: template === 'Minimal' ? '#111827' : theme.primary }}>{dict.s1_title}</Text>
        
        <View style={{ marginBottom: 15 }}>
            <Text style={styles.subHeader}>{dict.s1_executive}</Text>
            <Text style={styles.text}>
            {fullPlan?.executive_summary || "This HACCP plan outlines the systematic approach to controlling food safety hazards."}
            </Text>
        </View>

        <View style={{ marginBottom: 15 }}>
            <Text style={styles.subHeader}>{dict.s1_product}</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 5, backgroundColor: '#F9FAFB' }}><Text style={styles.coverLabel}>{dict.lbl_product_name}</Text></View>
                    <View style={{ width: '70%', padding: 5 }}><Text style={styles.text}>{data.productName}</Text></View>
                </View>
                <View style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 5, backgroundColor: '#F9FAFB' }}><Text style={styles.coverLabel}>{dict.lbl_description}</Text></View>
                    <View style={{ width: '70%', padding: 5 }}><Text style={styles.text}>{data.productDescription}</Text></View>
                </View>
                <View style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 5, backgroundColor: '#F9FAFB' }}><Text style={styles.coverLabel}>{dict.lbl_intended_use}</Text></View>
                    <View style={{ width: '70%', padding: 5 }}><Text style={styles.text}>{data.intendedUse}</Text></View>
                </View>
                <View style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 5, backgroundColor: '#F9FAFB' }}><Text style={styles.coverLabel}>{dict.lbl_storage}</Text></View>
                    <View style={{ width: '70%', padding: 5 }}><Text style={styles.text}>{data.storageType}</Text></View>
                </View>
            </View>
        </View>

        <View style={{ marginBottom: 15 }}>
            <Text style={styles.subHeader}>{dict.s1_process}</Text>
            <Text style={{...styles.text, marginBottom: 10}}>
            {fullPlan?.process_flow_narrative || "Process follows standard flow: Receiving -> Storage -> Prep -> Cook -> Service."}
            </Text>
            
            {/* Visual Process Flow in PDF - Enhanced Card Style */}
            <View style={{ marginTop: 15, padding: 10 }}>
                {data.analysis.map((item, i) => (
                    <View key={i} style={{ alignItems: 'center', width: '100%' }}>
                        <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            width: '80%', 
                            padding: 10,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: item.is_ccp ? '#FECACA' : '#E5E7EB', // Red-200 vs Gray-200
                            backgroundColor: item.is_ccp ? '#FEF2F2' : '#FFFFFF', // Red-50 vs White
                            marginBottom: 4
                        }}>
                            {/* Step Number Box */}
                            <View style={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: 4, 
                                backgroundColor: item.is_ccp ? '#EF4444' : '#F3F4F6', // Red-500 vs Gray-100
                                alignItems: 'center', 
                                justifyContent: 'center',
                                marginRight: 10
                            }}>
                                <Text style={{ 
                                    color: item.is_ccp ? '#FFFFFF' : '#6B7280', 
                                    fontSize: 10, 
                                    fontWeight: 'bold' 
                                }}>
                                    {i + 1}
                                </Text>
                            </View>

                            {/* Step Details */}
                            <View style={{ flex: 1 }}>
                                <Text style={{ 
                                    fontSize: 10, 
                                    fontWeight: 'bold', 
                                    color: item.is_ccp ? '#991B1B' : '#1F2937' // Red-800 vs Gray-800
                                }}>
                                    {item.step_name}
                                </Text>
                                <Text style={{ 
                                    fontSize: 7, 
                                    color: item.is_ccp ? '#B91C1C' : '#9CA3AF', 
                                    textTransform: 'uppercase',
                                    marginTop: 2
                                }}>
                                    {item.is_ccp ? 'CRITICAL CONTROL POINT' : 'PREREQUISITE STEP'}
                                </Text>
                            </View>
                        </View>
                        
                        {/* Connecting Arrow */}
                        {i < data.analysis.length - 1 && (
                            <Text style={{ fontSize: 12, color: '#D1D5DB', marginBottom: 4 }}>↓</Text>
                        )}
                    </View>
                ))}
            </View>
        </View>

        <CommonFooter dict={dict} />
      </Page>

      {/* PAGE 3: PREREQUISITE PROGRAMS */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={data.businessName} dict={dict} logo={logo} theme={theme} />
        
        <Text style={styles.sectionTitle}>{dict.s2_title}</Text>
        <Text style={{ ...styles.text, marginBottom: 10 }}>
            {dict.s2_desc}
        </Text>

        <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
                <View style={{ width: '30%', padding: 6 }}><Text style={styles.tableColHeader}>{dict.col_program}</Text></View>
                <View style={{ width: '70%', padding: 6 }}><Text style={styles.tableColHeader}>{dict.col_details}</Text></View>
            </View>
            {fullPlan?.prerequisite_programs?.map((prp, index) => (
                <View key={index} style={styles.tableRow}>
                    <View style={{ width: '30%', padding: 6 }}><Text style={{...styles.text, fontWeight: 'bold'}}>{prp.program}</Text></View>
                    <View style={{ width: '70%', padding: 6 }}><Text style={styles.text}>{prp.details}</Text></View>
                </View>
            ))}
        </View>

        <CommonFooter dict={dict} />
      </Page>

      {/* PAGE 4: HAZARD ANALYSIS */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={data.businessName} dict={dict} logo={logo} theme={theme} />
        
        <Text style={styles.sectionTitle}>{dict.s3_title}</Text>
        
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>{dict.col_step}</Text></View>
            <View style={{ ...styles.tableColHeader, width: '35%' }}><Text>{dict.col_hazards}</Text></View>
            <View style={{ ...styles.tableColHeader, width: '35%' }}><Text>{dict.col_control}</Text></View>
            <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>{dict.col_ccp}</Text></View>
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
                  <Text style={{fontSize: 8, color: '#9CA3AF'}}>{dict.val_prerequisite}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <CommonFooter dict={dict} />
      </Page>

      {/* PAGE 5: HACCP PLAN SUMMARY */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={data.businessName} dict={dict} logo={logo} theme={theme} />
        
        <Text style={styles.sectionTitle}>{dict.s4_title}</Text>
        <Text style={{ ...styles.text, marginBottom: 15 }}>
          {dict.s4_desc}
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
                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#B91C1C' }}>{dict.lbl_hazard}:</Text>
                    <Text style={styles.text}>{ccp.hazard}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 }}>
                    <View style={{ width: '33%', paddingRight: 10 }}>
                        <Text style={styles.subHeader}>{dict.lbl_critical_limit}</Text>
                        <Text style={styles.text}>{ccp.critical_limit}</Text>
                    </View>
                    <View style={{ width: '33%', paddingRight: 10, borderLeftWidth: 1, borderLeftColor: '#E5E7EB', paddingLeft: 10 }}>
                        <Text style={styles.subHeader}>{dict.lbl_monitoring}</Text>
                        <Text style={styles.text}>{ccp.monitoring}</Text>
                    </View>
                    <View style={{ width: '33%', paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}>
                        <Text style={styles.subHeader}>{dict.lbl_corrective}</Text>
                        <Text style={styles.text}>{ccp.corrective_action}</Text>
                    </View>
                  </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: 20, backgroundColor: '#F3F4F6', borderRadius: 4, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280' }}>
              {dict.msg_no_ccps}
            </Text>
          </View>
        )}

        <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}>
                <Text style={styles.signatureLabel}>{dict.sign_prepared}</Text>
            </View>
            <View style={styles.signatureLine}>
                <Text style={styles.signatureLabel}>{dict.sign_approved}</Text>
            </View>
        </View>

        <CommonFooter dict={dict} />
      </Page>

      {/* PAGE 6: BENCHMARKING & BEST PRACTICES */}
      {fullPlan?.benchmarking && (
        <Page size="A4" style={styles.page}>
          <CommonHeader title={data.businessName} dict={dict} logo={logo} theme={theme} />
          
          <Text style={styles.sectionTitle}>Safety Benchmarking & Best Practices</Text>
          
          <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#F3F4F6', borderRadius: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 5 }}>
              Safety Score: {fullPlan.benchmarking.score}%
            </Text>
            <Text style={styles.text}>
              {fullPlan.benchmarking.analysis_summary} (Industry average: {fullPlan.benchmarking.industry_avg}%)
            </Text>
          </View>

          <Text style={styles.subHeader}>Actionable Recommendations</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <View style={{ width: '20%', padding: 6 }}><Text style={styles.tableColHeader}>Impact</Text></View>
              <View style={{ width: '80%', padding: 6 }}><Text style={styles.tableColHeader}>Recommendation</Text></View>
            </View>
            {fullPlan.benchmarking.recommendations.map((rec, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={{ width: '20%', padding: 6 }}>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: rec.impact === 'High' ? '#B91C1C' : '#D97706' }}>
                    {rec.impact.toUpperCase()}
                  </Text>
                </View>
                <View style={{ width: '80%', padding: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{rec.title}</Text>
                  <Text style={{ fontSize: 8, color: '#6B7280' }}>{rec.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <CommonFooter dict={dict} />
        </Page>
      )}

      {/* PAGE 7: TOOLKIT - TEMPERATURE LOG */}
      <Page size="A4" style={styles.page}>
<CommonHeader title={dict.tk_title} dict={dict} logo={logo} theme={theme} />
        <Text style={{ ...styles.text, marginBottom: 10 }}>
            {dict.tk_temp_desc}
        </Text>

        <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
                <View style={{ width: '15%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_date}</Text></View>
                <View style={{ width: '15%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_time}</Text></View>
                <View style={{ width: '25%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_item}</Text></View>
                <View style={{ width: '15%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_temp}</Text></View>
                <View style={{ width: '15%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_action}</Text></View>
                <View style={{ width: '15%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_sign}</Text></View>
            </View>
            {[...Array(15)].map((_, i) => (
                <View key={i} style={styles.tableRow}>
                    <View style={{ width: '15%', height: 20 }}></View>
                    <View style={{ width: '15%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '25%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '15%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '15%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '15%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                </View>
            ))}
        </View>
        <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 5 }}>
            {dict.msg_corrective}
        </Text>
        <CommonFooter dict={dict} />
      </Page>

      {/* PAGE 7: TOOLKIT - CLEANING LOG */}
      <Page size="A4" style={styles.page}>
        <CommonHeader title={dict.tk_title} dict={dict} logo={logo} theme={theme} />
        <Text style={styles.sectionTitle}>{dict.tk_clean_title}</Text>
        
        <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
                <View style={{ width: '40%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_task}</Text></View>
                <View style={{ width: '10%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.days.mon}</Text></View>
                <View style={{ width: '10%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.days.tue}</Text></View>
                <View style={{ width: '10%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.days.wed}</Text></View>
                <View style={{ width: '10%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.days.thu}</Text></View>
                <View style={{ width: '10%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.days.fri}</Text></View>
                <View style={{ width: '10%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.days.sat_sun}</Text></View>
            </View>
            {[
                dict.tasks.surfaces,
                dict.tasks.cooking,
                dict.tasks.fridges,
                dict.tasks.sinks,
                dict.tasks.floors,
                dict.tasks.waste,
                dict.tasks.handwash
            ].map((task, i) => (
                <View key={i} style={styles.tableRow}>
                    <View style={{ width: '40%', padding: 5 }}><Text style={styles.text}>{task}</Text></View>
                    <View style={{ width: '10%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '10%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '10%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '10%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '10%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '10%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                </View>
            ))}
        </View>

        <Text style={styles.sectionTitle}>{dict.tk_train_title}</Text>
        <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
                <View style={{ width: '30%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_employee}</Text></View>
                <View style={{ width: '40%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_train_desc}</Text></View>
                <View style={{ width: '15%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_date}</Text></View>
                <View style={{ width: '15%', padding: 5 }}><Text style={styles.tableColHeader}>{dict.col_sign}</Text></View>
            </View>
            {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.tableRow}>
                    <View style={{ width: '30%', height: 20 }}></View>
                    <View style={{ width: '40%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '15%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                    <View style={{ width: '15%', height: 20, borderLeftWidth: 1, borderLeftColor: '#E5E7EB' }}></View>
                </View>
            ))}
        </View>

        <CommonFooter dict={dict} />
      </Page>
    </Document>
  );
};

export default HACCPDocument;