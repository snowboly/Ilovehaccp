import { Packer } from "docx";
import { generateModularWordDocument } from "./export/word/renderDocx";
import { buildExportDoc } from "./export/exportDoc";
import { getDictionary } from "./locales";
import { buildTemplateData, renderTemplateDocx, templateExists } from "./export/template";

// Environment flag to toggle template-based export
const USE_TEMPLATE = process.env.EXPORT_USE_TEMPLATE !== 'false';

export async function generateWordDocument(data: any, lang: string = 'en'): Promise<Buffer> {
  const isPaid = data.isPaid ?? false;

  // Use template-based generation if enabled and template exists
  if (USE_TEMPLATE && templateExists()) {
    try {
      const templateData = buildTemplateData(data, isPaid, data.logoBuffer);
      return await renderTemplateDocx(templateData);
    } catch (error) {
      console.error('Template generation failed, falling back to programmatic:', error);
      // Fall through to programmatic generation
    }
  }

  // Fallback: programmatic document generation
  const dict = (await getDictionary(lang as any)).pdf;
  const exportDoc = buildExportDoc({ data, dict, lang });
  const doc = await generateModularWordDocument(exportDoc);
  return Packer.toBuffer(doc);
}
