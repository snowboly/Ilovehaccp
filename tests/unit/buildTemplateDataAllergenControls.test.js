/**
 * Unit test for allergen controls mapping in buildTemplateData.
 * Run with: node tests/unit/buildTemplateDataAllergenControls.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const buildTemplatePath = path.resolve(__dirname, '../../src/lib/export/template/buildTemplateData.ts');

const loadBuildTemplateModule = () => {
  const source = fs.readFileSync(buildTemplatePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  });

  const module = { exports: {} };
  const mockRequire = (id) => {
    if (id === '@/data/haccp/loader') {
      return { getQuestions: () => ({ questions: [] }) };
    }
    return require(id);
  };

  const sandbox = {
    module,
    exports: module.exports,
    require: mockRequire,
    __dirname: path.dirname(buildTemplatePath),
    __filename: buildTemplatePath,
    console,
    process,
    Buffer,
  };

  vm.runInNewContext(outputText, sandbox, { filename: buildTemplatePath });
  return module.exports;
};

console.log('Test: Allergen controls map into template data...');
{
  const { buildTemplateData } = loadBuildTemplateModule();

  const data = {
    full_plan: {
      _original_inputs: {
        product: {
          allergens_present: ['Milk', 'Eggs'],
          allergen_cross_contact_risks: 'Shared equipment with nut products.',
          allergen_controls: ['Segregation', 'Cleaning validation'],
          allergen_controls_notes: 'Color-coded utensils.',
        },
      },
    },
  };

  const result = buildTemplateData(data, false, null);

  assert.strictEqual(result.allergens_present, 'Milk; Eggs');
  assert.strictEqual(result.allergen_cross_contact_risks, 'Shared equipment with nut products.');
  assert.strictEqual(result.allergen_controls, 'Segregation; Cleaning validation');
  assert.strictEqual(result.allergen_controls_notes, 'Color-coded utensils.');
  console.log('  ✓ PASSED');
}

console.log('\n✓ Allergen controls template data test passed!');
