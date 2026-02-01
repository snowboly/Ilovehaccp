#!/usr/bin/env node
/**
 * CI Export Validation Script
 * ============================
 * Validates DOCX export integrity by analyzing a generated DOCX file.
 *
 * Checks:
 * 1. No .undefined media files in DOCX
 * 2. Valid DOCX structure (required parts present)
 * 3. PRP table has proper Yes/No values (no invalid TBD)
 * 4. Hazard analysis table has readable severity values
 *
 * Usage:
 *   node scripts/ci-validate-export.js [path-to-docx]
 *
 * If no path provided, validates the golden plan fixture data structure.
 *
 * Exit codes:
 *   0 = All validations passed
 *   1 = Validation failed
 */

const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');

const ALLOWED_MEDIA_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'svg', 'gif', 'bmp']);

/**
 * Validate DOCX file structure and media
 */
function validateDocxFile(docxPath) {
  const failures = [];

  console.log(`📄 Validating DOCX: ${docxPath}`);

  if (!fs.existsSync(docxPath)) {
    console.error(`❌ File not found: ${docxPath}`);
    return ['File not found'];
  }

  const buffer = fs.readFileSync(docxPath);
  console.log(`  File size: ${buffer.length} bytes`);

  let zip;
  try {
    zip = new PizZip(buffer);
  } catch (err) {
    return [`DOCX parsing failed: ${err.message}`];
  }

  // 1. Check required DOCX parts
  console.log('🔍 Checking DOCX structure...');
  const requiredParts = [
    'word/document.xml',
    '[Content_Types].xml',
    '_rels/.rels'
  ];

  for (const part of requiredParts) {
    if (!zip.file(part)) {
      failures.push(`Missing required DOCX part: ${part}`);
    }
  }

  if (failures.length === 0) {
    console.log('  ✓ Required DOCX parts present');
  }

  // 2. Validate media files
  console.log('🔍 Checking media files...');
  const mediaFiles = zip.file(/word\/media\//) || [];

  const invalidMedia = mediaFiles.filter(file => {
    const ext = path.extname(file.name).toLowerCase().slice(1);
    return !ext || ext === 'undefined' || !ALLOWED_MEDIA_EXTENSIONS.has(ext);
  });

  if (invalidMedia.length > 0) {
    failures.push(`Invalid media files: ${invalidMedia.map(f => f.name).join(', ')}`);
    console.error('  ❌ Invalid media files:', invalidMedia.map(f => f.name));
  } else {
    console.log(`  ✓ Media files valid (${mediaFiles.length} files)`);
  }

  // 3. Check for Word compatibility issues
  console.log('🔍 Checking for compatibility issues...');
  const contentTypes = zip.file('[Content_Types].xml');
  if (contentTypes) {
    const content = contentTypes.asText();
    if (content.includes('.undefined')) {
      failures.push('Content_Types.xml references .undefined extension');
    }
  }

  // 4. Check document.xml for obvious issues
  const docXml = zip.file('word/document.xml');
  if (docXml) {
    const content = docXml.asText();

    // Check for null/undefined text nodes
    if (content.includes('>undefined<') || content.includes('>null<')) {
      failures.push('document.xml contains undefined/null text nodes');
    }

    // Check for empty required elements (basic sanity)
    if (!content.includes('<w:body>')) {
      failures.push('document.xml missing body element');
    }

    console.log('  ✓ Document structure valid');
  }

  return failures;
}

/**
 * Validate golden plan fixture data
 */
function validateGoldenPlanFixture() {
  const failures = [];
  const fixturePath = path.join(__dirname, 'fixtures', 'golden-plan.json');

  console.log('🔍 Validating golden plan fixture...');

  if (!fs.existsSync(fixturePath)) {
    console.error('❌ Golden plan fixture not found:', fixturePath);
    return ['Golden plan fixture not found'];
  }

  const plan = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  console.log(`  Fixture: ${plan.businessName}`);

  // Validate PRP programs have proper boolean values
  console.log('🔍 Checking PRP data...');
  const prps = plan.full_plan?.prerequisite_programs ||
               plan.full_plan?._original_inputs?.prp?.prp_programs || [];

  let yesYes = 0, yesNo = 0, noNo = 0, noYes = 0;

  for (const prp of prps) {
    if (typeof prp.exists !== 'boolean') {
      failures.push(`PRP "${prp.program}": exists is not boolean (${typeof prp.exists})`);
    }
    if (typeof prp.documented !== 'boolean') {
      failures.push(`PRP "${prp.program}": documented is not boolean (${typeof prp.documented})`);
    }

    // Count patterns
    if (prp.exists === true && prp.documented === true) yesYes++;
    else if (prp.exists === true && prp.documented === false) yesNo++;
    else if (prp.exists === false && prp.documented === false) noNo++;
    else if (prp.exists === false && prp.documented === true) noYes++;
  }

  console.log(`  ✓ PRP patterns: Yes/Yes=${yesYes}, Yes/No=${yesNo}, No/No=${noNo}, No/Yes=${noYes}`);

  // Validate hazard analysis
  console.log('🔍 Checking hazard analysis...');
  const hazards = plan.full_plan?.hazard_analysis || [];

  for (let i = 0; i < hazards.length; i++) {
    const h = hazards[i];
    if (!h.step_name && !h.step) {
      failures.push(`Hazard ${i + 1}: missing step_name`);
    }
    if (!h.severity) {
      failures.push(`Hazard ${i + 1}: missing severity`);
    }
    if (!h.likelihood) {
      failures.push(`Hazard ${i + 1}: missing likelihood`);
    }
    if (!['Yes', 'No', 'yes', 'no'].includes(h.is_ccp)) {
      failures.push(`Hazard ${i + 1}: is_ccp is "${h.is_ccp}" (expected Yes/No)`);
    }
  }

  console.log(`  ✓ Hazards validated: ${hazards.length} hazards`);

  // Validate CCPs
  console.log('🔍 Checking CCPs...');
  const ccps = plan.full_plan?.ccp_summary || [];

  for (let i = 0; i < ccps.length; i++) {
    const ccp = ccps[i];
    if (!ccp.ccp_id) failures.push(`CCP ${i + 1}: missing ccp_id`);
    if (!ccp.step) failures.push(`CCP ${i + 1}: missing step`);
    if (!ccp.critical_limit) failures.push(`CCP ${i + 1}: missing critical_limit`);
  }

  console.log(`  ✓ CCPs validated: ${ccps.length} CCPs`);

  return failures;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  let allFailures = [];

  console.log('');
  console.log('CI Export Validation');
  console.log('====================');
  console.log('');

  if (args.length > 0 && args[0].endsWith('.docx')) {
    // Validate specific DOCX file
    allFailures = validateDocxFile(args[0]);
  } else {
    // Validate golden plan fixture
    allFailures = validateGoldenPlanFixture();
  }

  console.log('');
  console.log('====================');

  if (allFailures.length === 0) {
    console.log('✅ All validations passed!');
    process.exit(0);
  } else {
    console.log(`❌ ${allFailures.length} validation(s) failed:`);
    allFailures.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
    process.exit(1);
  }
}

main();
