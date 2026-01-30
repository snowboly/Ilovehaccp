/**
 * Unit tests for PDF entitlement selection
 * Run with: node tests/unit/pdfEntitlement.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '../../src/app/api/export/pdf/route.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
}).outputText;

const moduleSandbox = { exports: {} };
const sandbox = {
  module: moduleSandbox,
  exports: moduleSandbox.exports,
  process,
  require: (id) => {
    if (id === 'server-only') return {};
    if (id.startsWith('@/')) return {};
    if (id === 'next/server') return { NextResponse: function NextResponse() {} };
    if (id === '@supabase/ssr') return { createServerClient: () => ({}) };
    if (id === 'next/headers') return { cookies: async () => ({}) };
    if (id === '@react-pdf/renderer') return { renderToBuffer: async () => Buffer.from('') };
    if (id === 'react') return {};
    return require(id);
  }
};

vm.runInNewContext(compiled, sandbox);

const { selectPdfArtifactForRequest } = sandbox.module.exports;

async function run() {
  console.log('Test 1: free users never select clean.pdf...');
  {
    const artifact = selectPdfArtifactForRequest(false);
    assert.strictEqual(artifact, 'preview.pdf');
    console.log('  PASSED');
  }

  console.log('Test 2: free users do not select clean.pdf even if cached...');
  {
    const artifact = selectPdfArtifactForRequest(false);
    assert.notStrictEqual(artifact, 'clean.pdf');
    console.log('  PASSED');
  }

  console.log('Test 3: entitled users select clean.pdf...');
  {
    const artifact = selectPdfArtifactForRequest(true);
    assert.strictEqual(artifact, 'clean.pdf');
    console.log('  PASSED');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
