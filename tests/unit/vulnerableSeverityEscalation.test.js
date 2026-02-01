/**
 * Unit tests for vulnerable consumer severity escalation.
 * Run with: node tests/unit/vulnerableSeverityEscalation.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const sourcePath = path.resolve(__dirname, '../../src/lib/haccp/vulnerableSeverityEscalation.ts');
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

const { applyVulnerableSeverityEscalation } = sandbox.module.exports;

const buildPayload = (description) => ({
  evaluation: { bio: { severity: 'Medium', likelihood: 'Medium' } },
  identification: { bio_hazards_description: description },
});

console.log('Test 1: Listeria escalation...');
{
  const { evaluation, identification } = buildPayload('Listeria monocytogenes in RTE foods');
  const result = applyVulnerableSeverityEscalation(evaluation, identification, true);
  assert.strictEqual(result.bio.severity, 'High');
  assert.strictEqual(result.bio.escalation_reason, 'Vulnerable consumer population');
  console.log('  PASSED');
}

console.log('Test 2: Salmonella escalation...');
{
  const { evaluation, identification } = buildPayload('Salmonella from raw poultry');
  const result = applyVulnerableSeverityEscalation(evaluation, identification, true);
  assert.strictEqual(result.bio.severity, 'High');
  assert.strictEqual(result.bio.escalation_reason, 'Vulnerable consumer population');
  console.log('  PASSED');
}

console.log('Test 3: E. coli O157 escalation...');
{
  const { evaluation, identification } = buildPayload('E. coli O157:H7 contamination');
  const result = applyVulnerableSeverityEscalation(evaluation, identification, true);
  assert.strictEqual(result.bio.severity, 'High');
  assert.strictEqual(result.bio.escalation_reason, 'Vulnerable consumer population');
  console.log('  PASSED');
}

console.log('Test 4: Campylobacter escalation...');
{
  const { evaluation, identification } = buildPayload('Campylobacter risk in poultry');
  const result = applyVulnerableSeverityEscalation(evaluation, identification, true);
  assert.strictEqual(result.bio.severity, 'High');
  assert.strictEqual(result.bio.escalation_reason, 'Vulnerable consumer population');
  console.log('  PASSED');
}

console.log('Test 5: Non-vulnerable case does not escalate...');
{
  const { evaluation, identification } = buildPayload('Listeria monocytogenes in RTE foods');
  const result = applyVulnerableSeverityEscalation(evaluation, identification, false);
  assert.strictEqual(result.bio.severity, 'Medium');
  assert.strictEqual(result.bio.escalation_reason, undefined);
  console.log('  PASSED');
}

console.log('\n✓ All vulnerable severity escalation tests passed!');
