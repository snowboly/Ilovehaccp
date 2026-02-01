/**
 * Unit tests for critical limit validation against standards.
 * Run with: node tests/unit/criticalLimitValidation.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const sourcePath = path.resolve(__dirname, '../../src/lib/export/criticalLimitValidation.ts');
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
  process: { env: { COOLING_TIME_TO_5C_MAX_HOURS: '6' } },
};

vm.runInNewContext(compiled, sandbox, { filename: sourcePath });

const { parseCriticalLimit, validateCriticalLimits } = sandbox.module.exports;

console.log('Test 1: parse temperature and time edge cases...');
{
  const temp = parseCriticalLimit('>= 75 Â°C for 30s');
  assert.strictEqual(temp.temperatureC, 75);
  assert.strictEqual(temp.temperatureComparator, '>=');

  const time = parseCriticalLimit('Cool to 5Â°C in 360 minutes');
  assert.strictEqual(time.timeHours, 6);
  console.log('  PASSED');
}

console.log('Test 2: cooking below standard fails without justification...');
{
  const fullPlan = {
    ccp_management: [
      {
        ccp_id: 'ccp_cook',
        step_name: 'Cooking',
        hazard: 'Pathogen survival',
        critical_limits: { critical_limit_value: '70Â°C' },
      },
    ],
  };
  const issues = validateCriticalLimits(fullPlan);
  assert.strictEqual(issues.length, 1);
  console.log('  PASSED');
}

console.log('Test 3: cooking below standard passes with justification + reference...');
{
  const fullPlan = {
    ccp_management: [
      {
        ccp_id: 'ccp_cook',
        step_name: 'Cooking',
        hazard: 'Pathogen survival',
        critical_limits: {
          critical_limit_value: '70Â°C',
          critical_limit_justification: 'Validated study',
          critical_limit_reference: 'Study-123',
        },
      },
    ],
  };
  const issues = validateCriticalLimits(fullPlan);
  assert.strictEqual(issues.length, 0);
  console.log('  PASSED');
}

console.log('Test 4: chilled storage <= 4Â°C passes, 5Â°C fails...');
{
  const okPlan = {
    ccp_management: [
      {
        ccp_id: 'ccp_chill',
        step_name: 'Chilled Storage',
        hazard: 'Growth',
        critical_limits: { critical_limit_value: '<=4Â°C' },
      },
    ],
  };
  assert.strictEqual(validateCriticalLimits(okPlan).length, 0);

  const badPlan = {
    ccp_management: [
      {
        ccp_id: 'ccp_chill',
        step_name: 'Chilled Storage',
        hazard: 'Growth',
        critical_limits: { critical_limit_value: '5Â°C' },
      },
    ],
  };
  assert.strictEqual(validateCriticalLimits(badPlan).length, 1);
  console.log('  PASSED');
}

console.log('Test 5: cooling time-to-5Â°C <= 6 hours passes, 7 hours fails...');
{
  const okPlan = {
    ccp_management: [
      {
        ccp_id: 'ccp_cool',
        step_name: 'Cooling',
        hazard: 'Spore germination',
        critical_limits: { critical_limit_value: 'Cool to 5Â°C in 6 hours' },
      },
    ],
  };
  assert.strictEqual(validateCriticalLimits(okPlan).length, 0);

  const badPlan = {
    ccp_management: [
      {
        ccp_id: 'ccp_cool',
        step_name: 'Cooling',
        hazard: 'Spore germination',
        critical_limits: { critical_limit_value: 'Cool to 5Â°C in 7 hours' },
      },
    ],
  };
  assert.strictEqual(validateCriticalLimits(badPlan).length, 1);
  console.log('  PASSED');
}

console.log('\nâœ“ All critical limit validation tests passed!');
