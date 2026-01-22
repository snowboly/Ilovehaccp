const fs = require('fs');
const path = require('path');

const sections = [
  { key: 'product', file: 'haccp_product_description_questions_v1.json' },
  { key: 'process', file: 'haccp_process_flow_questions_v1.json' },
  { key: 'prp', file: 'haccp_prerequisite_programs_questions_v1.json' },
  { key: 'hazards', file: 'haccp_hazard_analysis_questions_v1.json' },
  { key: 'ccp_determination', file: 'haccp_ccp_determination_questions_v1.json' },
  { key: 'ccp_management', file: 'haccp_ccp_management_questions_v1.json' },
  { key: 'validation', file: 'haccp_verification_validation_review_v1.json' },
];

const supportedTypes = new Set([
  'text',
  'multiline_text',
  'boolean',
  'single_select',
  'multi_select',
  'repeatable_list',
  'prp_group',
  'group',
  'group_per_hazard',
  'file_upload',
]);

const readJson = (filename) => {
  const fullPath = path.join(__dirname, '..', 'src', 'data', 'haccp', filename);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
};

const pushUnique = (arr, item, seen) => {
  if (seen.has(item.id)) return;
  seen.add(item.id);
  arr.push(item);
};

const extractQuestions = (questions, sectionKey, list, seen, parentId) => {
  if (!Array.isArray(questions)) return;

  questions.forEach((q) => {
    const baseId = parentId ? `${parentId}.${q.id}` : q.id;
    pushUnique(list, { id: baseId, type: q.type, section: sectionKey }, seen);

    if (q.type && !supportedTypes.has(q.type)) {
      pushUnique(list, { id: `${baseId}.__unsupported__`, type: q.type, section: sectionKey }, seen);
    }

    if (q.type === 'prp_group' && Array.isArray(q.fields)) {
      q.fields.forEach((field) => {
        const fieldId = `${q.id}.${field.id}`;
        pushUnique(list, { id: fieldId, type: 'prp_field', section: sectionKey }, seen);
      });
    }

    if (q.type === 'repeatable_list' && q.item_schema?.fields) {
      q.item_schema.fields.forEach((field) => {
        const fieldId = `${q.id}.${field.id}`;
        pushUnique(list, { id: fieldId, type: 'repeatable_field', section: sectionKey }, seen);
      });
    }

    if (q.type === 'group' && Array.isArray(q.questions)) {
      extractQuestions(q.questions, sectionKey, list, seen, q.id);
    }

    if (q.type === 'group_per_hazard' && Array.isArray(q.questions)) {
      extractQuestions(q.questions, sectionKey, list, seen, q.id);
    }

    if (Array.isArray(q.conditional_questions)) {
      q.conditional_questions.forEach((subQ) => {
        const subId = `${q.id}.${subQ.id}`;
        pushUnique(list, { id: subId, type: subQ.type || 'conditional', section: sectionKey }, seen);
      });
    }
  });
};

const report = [];
const unknownTypes = new Set();
const perSectionCounts = {};

sections.forEach((section) => {
  const json = readJson(section.file);
  const list = [];
  const seen = new Set();
  extractQuestions(json.questions, section.key, list, seen);

  perSectionCounts[section.key] = list.length;
  list.forEach((entry) => {
    if (entry.type && !supportedTypes.has(entry.type) && !entry.type.endsWith('_field') && entry.type !== 'conditional') {
      unknownTypes.add(`${entry.section}:${entry.type}`);
    }
  });

  report.push({ section: section.key, questions: list });
});

console.log('PDF Input Coverage Report');
console.log('-------------------------');
Object.entries(perSectionCounts).forEach(([key, count]) => {
  console.log(`${key}: ${count} entries`);
});

console.log('\nUnknown Types');
console.log('-------------');
if (unknownTypes.size === 0) {
  console.log('None');
} else {
  unknownTypes.forEach((entry) => console.log(entry));
  process.exitCode = 1;
}

console.log('\nDetailed IDs');
console.log('------------');
report.forEach((section) => {
  console.log(`\n[${section.section}]`);
  section.questions.forEach((q) => {
    console.log(`- ${q.id} (${q.type || 'unknown'})`);
  });
});
