/**
 * Unit tests for pdfPipeline.js
 * Run with: node tests/unit/pdfPipeline.test.js
 */

const assert = require("assert");
const {
  DEFAULT_PDF_PIPELINE,
  getPdfPipeline,
  normalizePdfPipeline,
} = require("../../src/lib/export/pdfPipeline");

const originalEnv = process.env.EXPORT_PDF_PIPELINE;

try {
  console.log("Test 1: default pipeline is docx when env is unset...");
  delete process.env.EXPORT_PDF_PIPELINE;
  assert.strictEqual(getPdfPipeline(), DEFAULT_PDF_PIPELINE);
  console.log("  ✓ PASSED");

  console.log("Test 2: legacy pipeline is respected...");
  process.env.EXPORT_PDF_PIPELINE = "legacy";
  assert.strictEqual(getPdfPipeline(), "legacy");
  console.log("  ✓ PASSED");

  console.log("Test 3: normalizePdfPipeline handles mixed case...");
  assert.strictEqual(normalizePdfPipeline("DoCx"), "docx");
  console.log("  ✓ PASSED");
} finally {
  if (originalEnv === undefined) {
    delete process.env.EXPORT_PDF_PIPELINE;
  } else {
    process.env.EXPORT_PDF_PIPELINE = originalEnv;
  }
}
