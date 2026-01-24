import { Packer } from "docx";
import { generateModularWordDocument } from "./export/word/renderDocx";
import { buildExportDoc } from "./export/exportDoc";
import { getDictionary } from "./locales";

export async function generateWordDocument(data: any, lang: string = 'en'): Promise<Buffer> {
  const dict = getDictionary(lang as any).pdf;
  const exportDoc = buildExportDoc({ data, dict, lang });
  const doc = await generateModularWordDocument(exportDoc);
  return Packer.toBuffer(doc);
}
