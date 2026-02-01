export type PdfPipelineConfig = {
  isProd: boolean;
  legacyAllowed: boolean;
  docxEnabled: boolean;
  useLegacy: boolean;
};

export type PdfPipeline = PdfPipelineConfig;

export function resolvePdfPipeline(env: NodeJS.ProcessEnv = process.env): PdfPipelineConfig {
  const isProd = env.NODE_ENV === 'production';
  const docxEnabled = env.PDF_USE_DOCX_CONVERSION !== 'false';
  const legacyRequested = (env.EXPORT_PDF_PIPELINE ?? 'docx') === 'legacy';
  const legacyAllowed = !isProd;
  const useLegacy = legacyAllowed && (legacyRequested || !docxEnabled);
  return { isProd, legacyAllowed, docxEnabled, useLegacy };
}
