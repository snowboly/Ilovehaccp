/**
 * Unit test for CCP management export mapping
 * Run with: node tests/unit/exportDocCcpManagement.test.js
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ts = require("typescript");

const exportDocPath = path.resolve(__dirname, "../../src/lib/export/exportDoc.ts");

const loadExportDocModule = () => {
  const source = fs.readFileSync(exportDocPath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  });

  const module = { exports: {} };
  const mockRequire = (id) => {
    if (id === "@/data/haccp/loader") {
      return {
        getQuestions: (section) => {
          if (section === "ccp_management") {
            return {
              questions: [
                {
                  id: "monitoring",
                  text: "Monitoring",
                  type: "group",
                  questions: [
                    {
                      id: "monitoring_parameter",
                      text: "What parameter is monitored?",
                      type: "text",
                      required: true,
                    },
                  ],
                },
                {
                  id: "corrective_actions",
                  text: "Corrective Actions",
                  type: "group",
                  questions: [
                    {
                      id: "deviation_action",
                      text: "What action is taken if the critical limit is exceeded?",
                      type: "text",
                      required: true,
                    },
                  ],
                },
              ],
            };
          }
          return { questions: [] };
        },
      };
    }
    return require(id);
  };

  const sandbox = {
    module,
    exports: module.exports,
    require: mockRequire,
    __dirname: path.dirname(exportDocPath),
    __filename: exportDocPath,
    console,
    process,
    Buffer,
  };

  vm.runInNewContext(outputText, sandbox, { filename: exportDocPath });
  return module.exports;
};

console.log("Test: CCP management export preserves per-CCP answers...");
{
  const { buildExportDoc, resolveExportText } = loadExportDocModule();

  const ccpManagement = {
    ccp_Step1_HazardA: {
      ccp_id: "ccp_Step1_HazardA",
      step_name: "Step 1",
      hazard: "Hazard A",
      monitoring: { monitoring_parameter: "Temp A" },
      corrective_actions: { deviation_action: "Discard A" },
    },
    ccp_Step2_HazardB: {
      ccp_id: "ccp_Step2_HazardB",
      step_name: "Step 2",
      hazard: "Hazard B",
      monitoring: { monitoring_parameter: "Temp B" },
      corrective_actions: { deviation_action: "Discard B" },
    },
  };

  const data = {
    full_plan: {
      ccp_summary: [
        { ccp_step: "Step 1", hazard: "Hazard A" },
        { ccp_step: "Step 2", hazard: "Hazard B" },
      ],
      _original_inputs: {
        ccp_management: ccpManagement,
      },
    },
  };

  const dict = {
    s1_title: "",
    s2_title: "",
    s3_title: "",
    s4_title: "",
    s5_title: "",
    s6_title: "",
    s7_title: "",
    s8_title: "",
    s9_title: "",
    s10_title: "",
    lbl_product_name: "",
    lbl_description: "",
    lbl_ingredients: "",
    lbl_storage: "",
    lbl_shelf_life: "",
    lbl_intended_use: "",
    col_program: "",
    col_details: "",
    col_step: "",
    lbl_hazard: "",
    col_ccp: "",
    col_control: "",
    col_hazards: "",
    lbl_critical_limit: "",
    lbl_monitoring: "",
    lbl_corrective: "",
    msg_no_ccps: "",
    sign_prepared: "",
    sign_approved: "",
  };

  const exportDoc = buildExportDoc({
    data,
    dict,
    lang: "en",
  });

  const allRows = exportDoc.content
    .filter((block) => block.type === "table")
    .flatMap((block) => block.rows || []);

  const rowValues = allRows.map((row) => resolveExportText(row[1], "pdf"));

  assert(rowValues.includes("Temp A"), "Expected CCP 1 monitoring value");
  assert(rowValues.includes("Temp B"), "Expected CCP 2 monitoring value");
  assert(rowValues.includes("Discard A"), "Expected CCP 1 corrective action");
  assert(rowValues.includes("Discard B"), "Expected CCP 2 corrective action");

  console.log("  ✓ PASSED");
}

console.log("\n✓ All CCP management export tests passed!");
