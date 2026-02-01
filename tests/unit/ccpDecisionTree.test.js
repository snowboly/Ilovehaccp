/**
 * Unit tests for CCP decision tree classification.
 * Run with: node tests/unit/ccpDecisionTree.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const sourcePath = path.resolve(__dirname, '../../src/lib/builder/ccpDecisionTree.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
}).outputText;

const moduleSandbox = { exports: {} };
const sandbox = {
  module: moduleSandbox,
  exports: moduleSandbox.exports,
  require,
  __dirname: path.dirname(sourcePath),
  __filename: sourcePath,
  console,
};

vm.runInNewContext(compiled, sandbox, { filename: sourcePath });

const { classifyControl } = sandbox.module.exports;

console.log('Test 1: q1=false always returns PRP (no CCP bug)...');
{
  const result = classifyControl({ q1: false, q2: true, q3: true, q4: false });
  assert.strictEqual(result, 'PRP');
  console.log('  PASSED');
}

console.log('Test 2: q2=true returns CCP...');
{
  const result = classifyControl({ q1: true, q2: true, q3: false, q4: true });
  assert.strictEqual(result, 'CCP');
  console.log('  PASSED');
}

console.log('Test 3: q3=true and q4=true returns OPRP...');
{
  const result = classifyControl({ q1: true, q2: false, q3: true, q4: true });
  assert.strictEqual(result, 'OPRP');
  console.log('  PASSED');
}

console.log('Test 4: q3=true and q4=false returns CCP...');
{
  const result = classifyControl({ q1: true, q2: false, q3: true, q4: false });
  assert.strictEqual(result, 'CCP');
  console.log('  PASSED');
}

console.log('Test 5: fallback returns OPRP...');
{
  const result = classifyControl({ q1: true, q2: false, q3: false, q4: false });
  assert.strictEqual(result, 'OPRP');
  console.log('  PASSED');
}

console.log('\n✓ All CCP decision tree tests passed!');
