/**
 * Template-based DOCX renderer
 * Uses programmatic Minneapolis-style template generation
 *
 * Note: The original plan was to use docxtemplater to fill a provided template,
 * but the provided HACCP-template.docx is a specific ROP (Reduced Oxygen Packaging)
 * template with hardcoded content. Instead, we generate a professional Minneapolis-style
 * document programmatically using the docx library.
 */

import type { TemplateData } from './buildTemplateData';
import { generateMinneapolisDocument } from './generateMinneapolisTemplate';

/**
 * Renders a professional HACCP DOCX document in Minneapolis style
 */
export async function renderTemplateDocx(data: TemplateData): Promise<Buffer> {
  return generateMinneapolisDocument(data);
}

/**
 * Template system is always available (uses programmatic generation)
 */
export function templateExists(): boolean {
  return true;
}

/**
 * Get information about the template system
 */
export function getTemplatePath(): string {
  return 'Minneapolis-style programmatic template';
}
