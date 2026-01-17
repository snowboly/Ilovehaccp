import { Packer } from "docx";
import { saveAs } from "file-saver";
import { getTheme } from "./export/getTheme";
import { generateModularWordDocument } from "./export/word/renderDocx";

export const generateHACCPWordDoc = async (data: any) => {
  // 1. Determine Theme
  // Client-side might pass template in data.full_plan._original_inputs or directly
  const originalInputs = data.full_plan?._original_inputs || {};
  const themeId = originalInputs.template || "Audit Classic";
  const theme = getTheme(themeId);

  // 2. Generate Document (reusing the modular logic)
  const doc = await generateModularWordDocument(data, theme);

  // 3. Save to Blob
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `HACCP_Plan_${(data.businessName || "Draft").replace(/\s+/g, "_")}.docx`);
};
