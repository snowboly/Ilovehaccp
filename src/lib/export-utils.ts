import { Packer } from "docx";
import { saveAs } from "file-saver";
import { buildExportDoc } from "./export/exportDoc";
import { generateModularWordDocument } from "./export/word/renderDocx";
import { getDictionary } from "./locales";

export const generateHACCPWordDoc = async (data: any) => {
  const lang = data?.lang || "en";
  const dict = (await getDictionary(lang as any)).pdf;
  const exportDoc = buildExportDoc({ data, dict, lang });
  const doc = await generateModularWordDocument(exportDoc);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `HACCP_Plan_${(data.businessName || "Draft").replace(/\s+/g, "_")}.docx`);
};
