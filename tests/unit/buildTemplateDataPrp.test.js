/**
 * Unit test for PRP Yes/Yes mapping in buildTemplateData
 * Run with: node tests/unit/buildTemplateDataPrp.test.js
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
      return {
        getQuestions: () => ({
          questions: [
            { id: 'prp_cleaning_sanitation', text: 'Cleaning and sanitation' },
          ],
        }),
      };
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

console.log('Test: PRP Yes/Yes mapping uses boolean inputs...');
{
  const { buildTemplateData } = loadBuildTemplateModule();

  const data = {
    full_plan: {
      _original_inputs: {
        prp: {
          prp_cleaning_sanitation: {
            inPlace: true,
            documented: true,
            reference: 'SOP-001',
          },
        },
      },
      prerequisite_programs: [],
    },
  };

  const result = buildTemplateData(data, false, null);
  const prp = result.prp_programs[0];

  assert.strictEqual(prp.exists, 'Yes', 'Expected PRP exists to be Yes');
  assert.strictEqual(prp.documented, 'Yes', 'Expected PRP documented to be Yes');
  console.log('  ✓ PASSED');
}

console.log('\n✓ All PRP mapping tests passed!');
