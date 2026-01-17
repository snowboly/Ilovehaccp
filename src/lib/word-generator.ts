import { Packer } from "docx";
import { getTheme } from "./export/getTheme";
import { generateModularWordDocument } from "./export/word/renderDocx";

export async function generateWordDocument(data: any, lang: string = 'en'): Promise<Buffer> {
  const originalInputs = data.full_plan?._original_inputs || {};
  const themeId = originalInputs.template || originalInputs.validation?.document_style;
  const theme = getTheme(themeId);
  
  const doc = await generateModularWordDocument(data, theme, lang);
  return Packer.toBuffer(doc);
}