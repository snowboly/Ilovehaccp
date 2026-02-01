/**
 * Unit tests for hazard significance matrix enforcement.
 * Run with: node tests/unit/significanceMatrix.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const sourcePath = path.resolve(__dirname, '../../src/lib/haccp/significanceMatrix.ts');
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

const { isSignificant, applySignificanceToHazardEvaluation } = sandbox.module.exports;

console.log('Test 1: significance matrix truth table...');
{
  const cases = [
    ['High', 'High', true],
    ['High', 'Medium', true],
    ['High', 'Low', true],
    ['Medium', 'High', true],
    ['Medium', 'Medium', true],
    ['Medium', 'Low', false],
    ['Low', 'High', true],
    ['Low', 'Medium', false],
    ['Low', 'Low', false],
  ];

  cases.forEach(([severity, likelihood, expected]) => {
    assert.strictEqual(
      isSignificant(severity, likelihood),
      expected,
      `Expected ${severity}/${likelihood} => ${expected}`
    );
  });
  console.log('  PASSED');
}

console.log('Test 2: user override is ignored (stored true when matrix says significant)...');
{
  const input = {
    bio: { severity: 'High', likelihood: 'Medium', is_significant: false },
  };
  const output = applySignificanceToHazardEvaluation(input);
  assert.strictEqual(output.bio.is_significant, true);
  console.log('  PASSED');
}

console.log('\n✓ All significance matrix tests passed!');
