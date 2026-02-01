/**
 * Unit tests for PDF pipeline selection
 * Run with: node tests/unit/pdfPipeline.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '../../src/lib/export/pdf/pipeline.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
}).outputText;

const moduleSandbox = { exports: {} };
const sandbox = {
  module: moduleSandbox,
  exports: moduleSandbox.exports,
  process,
  require: (id) => require(id)
};

vm.runInNewContext(compiled, sandbox);

const { resolvePdfPipeline } = sandbox.module.exports;

function run() {
  console.log('Test 0: production never allows legacy PDF pipeline...');
  {
    const config = resolvePdfPipeline({
      NODE_ENV: 'production',
      EXPORT_PDF_PIPELINE: 'legacy',
      PDF_USE_DOCX_CONVERSION: 'true'
    });
    assert.strictEqual(config.useLegacy, false);
    assert.strictEqual(config.legacyAllowed, false);
    console.log('  PASSED');
  }
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
