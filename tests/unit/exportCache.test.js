/**
 * Unit tests for export cache helpers
 * Run with: node tests/unit/exportCache.test.js
 */

const assert = require('assert');

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '../../src/lib/export/cache/exportCache.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 }
}).outputText;

const moduleSandbox = { exports: {} };
const nodeCrypto = require('node:crypto');
const sandbox = {
  module: moduleSandbox,
  exports: moduleSandbox.exports,
  process,
  require: (id) => {
    if (id === 'server-only') return {};
    if (id === '@/lib/supabase') return { supabaseService: {} };
    if (id === 'node:crypto' || id === 'crypto') return nodeCrypto;
    return require(id);
  }
};

vm.runInNewContext(compiled, sandbox);

const { computeContentHash, resolvePdfArtifactType, getOrGenerateArtifact, buildDocxTemplateVersion, DOCX_TEMPLATE_VERSION } = sandbox.module.exports;

async function run() {
  console.log('Test 0: content hash stable across key order...');
  {
    const payloadA = {
      businessName: 'Acme',
      productName: 'Widget',
      full_plan: { meta: { b: 2, a: 1 }, steps: [1, 2, 3] }
    };
    const payloadB = {
      full_plan: { steps: [1, 2, 3], meta: { a: 1, b: 2 } },
      productName: 'Widget',
      businessName: 'Acme'
    };
    const hashA = computeContentHash(payloadA, 'minneapolis-v1');
    const hashB = computeContentHash(payloadB, 'minneapolis-v1');
    assert.strictEqual(hashA, hashB);
    console.log('  PASSED');
  }

  console.log('Test 1: content hash changes when plan content changes...');
  {
    const basePayload = { businessName: 'Acme', full_plan: { steps: [1, 2, 3] }, isPaid: true };
    const hashA = computeContentHash(basePayload, 'minneapolis-v1');
    const hashB = computeContentHash({ ...basePayload, businessName: 'Acme Foods' }, 'minneapolis-v1');
    assert.notStrictEqual(hashA, hashB);
    console.log('  PASSED');
  }

  console.log('Test 2: content hash changes when template version changes...');
  {
    const payload = { businessName: 'Acme', full_plan: { steps: [1, 2, 3] }, isPaid: true };
    const hashA = computeContentHash(payload, 'minneapolis-v1');
    const hashB = computeContentHash(payload, 'minneapolis-v2');
    assert.notStrictEqual(hashA, hashB);
    console.log('  PASSED');
  }

  console.log('Test 3: content hash changes when export version changes...');
  {
    const payload = { businessName: 'Acme', full_plan: { steps: [1, 2, 3] }, isPaid: true };
    const hashA = computeContentHash(payload, 'minneapolis-v1', 'docx-v1');
    const hashB = computeContentHash(payload, 'minneapolis-v1', 'legacy-v1');
    assert.notStrictEqual(hashA, hashB);
    console.log('  PASSED');
  }

  console.log('Test 4: DOCX template version is included in cache key...');
  {
    const payload = { businessName: 'Acme', full_plan: { steps: [1, 2, 3] }, isPaid: true };
    const versionA = buildDocxTemplateVersion('minneapolis-v1');
    const versionB = `minneapolis-v1:${DOCX_TEMPLATE_VERSION}-bump`;
    const hashA = computeContentHash(payload, versionA);
    const hashB = computeContentHash(payload, versionB);
    assert.notStrictEqual(hashA, hashB);
    console.log('  PASSED');
  }

  console.log('Test 5: free users resolve preview.pdf artifact...');
  {
    const artifact = resolvePdfArtifactType(false);
    assert.strictEqual(artifact, 'preview.pdf');
    console.log('  PASSED');
  }

  console.log('Test 6: cache hit returns without generation...');
  {
    let generateCalled = false;
    const cachedBuffer = Buffer.from('cached');
    const result = await getOrGenerateArtifact({
      getCached: async () => cachedBuffer,
      generate: async () => {
        generateCalled = true;
        return Buffer.from('generated');
      },
      store: async () => {}
    });
    assert.strictEqual(result.buffer.toString(), 'cached');
    assert.strictEqual(generateCalled, false);
    console.log('  PASSED');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

