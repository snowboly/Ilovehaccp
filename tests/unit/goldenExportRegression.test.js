/**
 * Golden plan regression test for DOCX/PDF exports.
 * Run with: node tests/unit/goldenExportRegression.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');
const PizZip = require('pizzip');
const React = require('react');
const { Packer } = require('docx');
const { renderToBuffer } = require('@react-pdf/renderer');

const ROOT = path.resolve(__dirname, '../../');
const SRC = path.join(ROOT, 'src');

const moduleCache = new Map();

const resolveFile = (rawPath) => {
  const candidates = [
    rawPath,
    `${rawPath}.ts`,
    `${rawPath}.tsx`,
    `${rawPath}.js`,
    `${rawPath}.jsx`,
    path.join(rawPath, 'index.ts'),
    path.join(rawPath, 'index.tsx'),
    path.join(rawPath, 'index.js'),
    path.join(rawPath, 'index.jsx'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
};

const loadTsModule = (filePath, { mocks = {} } = {}) => {
  const resolvedPath = resolveFile(filePath) || filePath;
  if (moduleCache.has(resolvedPath)) {
    return moduleCache.get(resolvedPath).exports;
  }

  const source = fs.readFileSync(resolvedPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  });

  const module = { exports: {} };
  moduleCache.set(resolvedPath, module);

  const mockRequire = (id) => {
    if (mocks[id]) return mocks[id];
    if (id === 'server-only') return {};
    if (id.startsWith('@/')) {
      const mapped = resolveFile(path.join(SRC, id.slice(2)));
      if (!mapped) return {};
      return loadTsModule(mapped, { mocks });
    }
    if (id.startsWith('.') || path.isAbsolute(id)) {
      const mapped = resolveFile(path.resolve(path.dirname(resolvedPath), id));
      if (!mapped) return require(id);
      if (mapped.endsWith('.ts') || mapped.endsWith('.tsx')) {
        return loadTsModule(mapped, { mocks });
      }
      return require(mapped);
    }
    return require(id);
  };

  const sandbox = {
    module,
    exports: module.exports,
    require: mockRequire,
    __dirname: path.dirname(resolvedPath),
    __filename: resolvedPath,
    console,
    process,
    Buffer,
    setTimeout,
    clearTimeout,
  };

  vm.runInNewContext(outputText, sandbox, { filename: resolvedPath });
  return module.exports;
};

const getPdfEntitlementModule = () => {
  const sourcePath = path.join(SRC, 'app/api/export/pdf/route.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
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
    },
  };

  vm.runInNewContext(compiled, sandbox);
  return sandbox.module.exports;
};

const getDocxText = (zip) => {
  const documentXml = zip.file('word/document.xml')?.asText() || '';
  const runs = [...documentXml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)];
  return runs.map((match) => match[1]).join('');
};

const countOccurrences = (haystack, needle) => {
  if (!needle) return 0;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  return (haystack.match(regex) || []).length;
};

const collectExportText = (doc, resolveExportText, target) => {
  const chunks = [];
  const pushText = (value) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'string') return chunks.push(value);
    chunks.push(resolveExportText(value, target));
  };

  const handleBlock = (block) => {
    if (!block || !block.type) return;
    if (block.type === 'section' || block.type === 'subheading') return pushText(block.title || block.text);
    if (block.type === 'paragraph') return pushText(block.text);
    if (block.type === 'signature') {
      pushText(block.left);
      pushText(block.right);
      return;
    }
    if (block.type === 'table') {
      block.headers?.forEach(pushText);
      block.rows?.forEach((row) => row.forEach(pushText));
    }
  };

  doc.content.forEach(handleBlock);
  return chunks.join(' ');
};

async function run() {
  const mocks = {
    '@/data/haccp/loader': {
      getQuestions: () => ({ questions: [] }),
    },
  };

  const { samplePlanFixture } = loadTsModule(path.join(SRC, 'lib/export/sample/fixture.ts'), { mocks });
  const { getDictionary } = loadTsModule(path.join(SRC, 'lib/locales.ts'), { mocks });
  const { buildExportDoc, resolveExportText } = loadTsModule(
    path.join(SRC, 'lib/export/exportDoc.ts'),
    { mocks }
  );
  const { generateModularWordDocument } = loadTsModule(
    path.join(SRC, 'lib/export/word/renderDocx.ts'),
    { mocks }
  );
  const { HACCPDocumentModular } = loadTsModule(
    path.join(SRC, 'lib/export/pdf/renderPdf.tsx'),
    { mocks }
  );

  const logoBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  const logoBuffer = Buffer.from(logoBase64, 'base64');
  const logoDataUri = `data:image/png;base64,${logoBase64}`;
  const intendedUse = 'Ready-to-eat, refrigerated (Golden Plan)';

  const fixture = {
    ...samplePlanFixture,
    intendedUse,
    logoBuffer,
    fullPlan: {
      ...samplePlanFixture.fullPlan,
      _original_inputs: {
        ...samplePlanFixture.fullPlan._original_inputs,
        product: {
          ...samplePlanFixture.fullPlan._original_inputs.product,
          intended_use: intendedUse,
        },
        prp: {
          prp_cleaning_sanitation: {
            inPlace: true,
            documented: true,
            reference: 'SOP-001',
          },
        },
      },
    },
  };

  const dict = getDictionary('en').pdf;
  const exportDoc = buildExportDoc({
    data: fixture,
    dict,
    lang: 'en',
    logoDataUri,
  });

  console.log('Test 1: DOCX export generates with logo...');
  const doc = await generateModularWordDocument(exportDoc);
  const docxBuffer = await Packer.toBuffer(doc);
  const zip = new PizZip(docxBuffer);
  const mediaFiles = zip.file(/word\/media\//) ?? [];
  assert(mediaFiles.length > 0, 'Expected DOCX to include embedded media for logo.');
  console.log('  PASSED');

  console.log('Test 2: DOCX intended use appears once and no TBD...');
  const docxText = getDocxText(zip);
  assert.strictEqual(
    countOccurrences(docxText, intendedUse),
    1,
    'Intended use should appear once in DOCX output.'
  );
  assert(!docxText.includes('TBD'), 'DOCX output should not contain TBD for boolean answers.');
  console.log('  PASSED');

  console.log('Test 3: PDF export generates with logo...');
  const pdfBuffer = await renderToBuffer(React.createElement(HACCPDocumentModular, { doc: exportDoc }));
  const pdfText = pdfBuffer.toString('latin1');
  assert(pdfBuffer.length > 0, 'Expected PDF buffer to be non-empty.');
  assert(pdfText.includes('/Subtype /Image'), 'Expected PDF to include an embedded image.');
  console.log('  PASSED');

  console.log('Test 4: PDF export text remains stable (no intended use duplication, no TBD)...');
  const exportText = collectExportText(exportDoc, resolveExportText, 'pdf');
  assert.strictEqual(
    countOccurrences(exportText, intendedUse),
    1,
    'Intended use should appear once in PDF export data.'
  );
  assert(!exportText.includes('TBD'), 'PDF export data should not contain TBD for boolean answers.');
  console.log('  PASSED');

  console.log('Test 5: Free export never serves clean.pdf...');
  {
    const { selectPdfArtifactForRequest } = getPdfEntitlementModule();
    const artifact = selectPdfArtifactForRequest(false);
    assert.notStrictEqual(artifact, 'clean.pdf');
  }
  console.log('  PASSED');

  console.log('\n✓ Golden plan export regression test passed!');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
