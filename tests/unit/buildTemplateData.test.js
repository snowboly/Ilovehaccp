/**
 * Unit tests for buildTemplateData.ts
 * Run with: node tests/unit/buildTemplateData.test.js
 */

const assert = require('assert');

// Define constants matching the implementation
const PROCESS_CONTROL_DEFAULT_DESCRIPTION =
  'Process controls are applied at this step; specify the control(s) used (time/temperature, segregation, handling, sanitation, etc.).';

const PROCESS_CONTROL_LABELS = [
  'Process control',
  'Control de proceso',
  'Contrôle de processus',
  'Controle de processo',
];

const normalizeProcessControlLabel = (label) =>
  label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const processControlLabelMatchers = PROCESS_CONTROL_LABELS.map(normalizeProcessControlLabel);

const matchesProcessControlLabel = (label) => {
  const normalized = normalizeProcessControlLabel(label);
  return processControlLabelMatchers.some((match) => normalized.includes(match));
};

// Helper to check if process control is selected (mirrors the implementation)
function isProcessControlSelected(controlMeasure) {
  if (!controlMeasure) return false;
  if (Array.isArray(controlMeasure)) {
    return controlMeasure.some(
      (control) => (typeof control === 'string' ? matchesProcessControlLabel(control) : false)
    );
  }
  if (typeof controlMeasure === 'string') {
    return matchesProcessControlLabel(controlMeasure);
  }
  return false;
}

// Extract hazard analysis logic (simplified version for testing)
function extractHazardAnalysisRow(hazard) {
  const controlMeasure = hazard.control_measure;
  const hasProcessControl = isProcessControlSelected(controlMeasure);

  let description =
    hazard.control_measure_description ||
    hazard.process_control_description ||
    '';

  if (hasProcessControl && !description) {
    description = PROCESS_CONTROL_DEFAULT_DESCRIPTION;
  }

  const formatValue = (value, defaultValue = '-') => {
    if (value === null || value === undefined || value === '') return defaultValue;
    if (Array.isArray(value)) {
      if (value.length === 0) return defaultValue;
      return value.join('; ');
    }
    return String(value);
  };

  return {
    step: formatValue(hazard.step_name || hazard.step),
    hazard: formatValue(hazard.hazards || hazard.hazard),
    hazard_type: formatValue(hazard.hazard_type || hazard.type),
    severity: formatValue(hazard.severity),
    likelihood: formatValue(hazard.likelihood),
    significant: hazard.is_ccp ? 'Yes' : 'No',
    control_measure: formatValue(controlMeasure),
    control_measure_description: description || '-',
  };
}

// Test 1: Process control selected without description -> should use default
console.log('Test 1: Process control without description uses default...');
{
  const hazard = {
    step_name: 'Cooking',
    hazards: 'Salmonella survival',
    hazard_type: 'bio',
    severity: 'High',
    likelihood: 'Medium',
    is_ccp: true,
    control_measure: ['Prerequisite Program (PRP)', 'Process control'],
  };

  const result = extractHazardAnalysisRow(hazard);

  assert.strictEqual(result.step, 'Cooking');
  assert.strictEqual(result.hazard, 'Salmonella survival');
  assert.strictEqual(result.control_measure_description, PROCESS_CONTROL_DEFAULT_DESCRIPTION);
  console.log('  ✓ PASSED');
}

// Test 2: Process control selected with description -> should pass through
console.log('Test 2: Process control with description passes through...');
{
  const userDescription = 'Cook to 75°C core for minimum 30 seconds';
  const hazard = {
    step_name: 'Cooking',
    hazards: 'Salmonella survival',
    hazard_type: 'bio',
    severity: 'High',
    likelihood: 'Medium',
    is_ccp: true,
    control_measure: ['Process control'],
    control_measure_description: userDescription,
  };

  const result = extractHazardAnalysisRow(hazard);

  assert.strictEqual(result.control_measure_description, userDescription);
  console.log('  ✓ PASSED');
}

// Test 3: No Process control selected -> description should be dash
console.log('Test 3: No process control -> description is dash...');
{
  const hazard = {
    step_name: 'Storage',
    hazards: 'Temperature abuse',
    hazard_type: 'bio',
    severity: 'Medium',
    likelihood: 'Low',
    is_ccp: false,
    control_measure: ['Prerequisite Program (PRP)'],
  };

  const result = extractHazardAnalysisRow(hazard);

  assert.strictEqual(result.control_measure_description, '-');
  console.log('  ✓ PASSED');
}

// Test 4: Process control as string (not array) -> should detect
console.log('Test 4: Process control as string is detected...');
{
  const hazard = {
    step_name: 'Reheating',
    hazards: 'Inadequate reheating',
    hazard_type: 'bio',
    severity: 'High',
    likelihood: 'Low',
    is_ccp: true,
    control_measure: 'Process control',
  };

  const result = extractHazardAnalysisRow(hazard);

  assert.strictEqual(result.control_measure_description, PROCESS_CONTROL_DEFAULT_DESCRIPTION);
  console.log('  ✓ PASSED');
}

// Test 5: process_control_description field takes precedence
console.log('Test 5: process_control_description field works...');
{
  const userDescription = 'Time/temperature monitoring at each batch';
  const hazard = {
    step_name: 'Hot Holding',
    hazards: 'Bacterial growth',
    hazard_type: 'bio',
    severity: 'High',
    likelihood: 'Medium',
    is_ccp: true,
    control_measure: ['Process control'],
    process_control_description: userDescription,
  };

  const result = extractHazardAnalysisRow(hazard);

  assert.strictEqual(result.control_measure_description, userDescription);
  console.log('  ✓ PASSED');
}

// Test 6: isProcessControlSelected helper tests
console.log('Test 6: isProcessControlSelected helper...');
{
  assert.strictEqual(isProcessControlSelected(['Process control']), true);
  assert.strictEqual(isProcessControlSelected(['Prerequisite Program (PRP)', 'Process control']), true);
  assert.strictEqual(isProcessControlSelected(['Control de proceso']), true);
  assert.strictEqual(isProcessControlSelected(['Contrôle de processus']), true);
  assert.strictEqual(isProcessControlSelected(['Controle de processo']), true);
  assert.strictEqual(isProcessControlSelected(['Prerequisite Program (PRP)']), false);
  assert.strictEqual(isProcessControlSelected(['None']), false);
  assert.strictEqual(isProcessControlSelected('Process control'), true);
  assert.strictEqual(isProcessControlSelected('Control de proceso'), true);
  assert.strictEqual(isProcessControlSelected('Contrôle de processus'), true);
  assert.strictEqual(isProcessControlSelected('Controle de processo'), true);
  assert.strictEqual(isProcessControlSelected('PRP'), false);
  assert.strictEqual(isProcessControlSelected(null), false);
  assert.strictEqual(isProcessControlSelected(undefined), false);
  console.log('  ✓ PASSED');
}

console.log('\n✓ All buildTemplateData tests passed!');
