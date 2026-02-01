export type PdfPipeline = 'docx' | 'legacy';

export const resolvePdfPipeline = (env: NodeJS.ProcessEnv) => {
  const pipeline = (env.EXPORT_PDF_PIPELINE ?? 'docx') as PdfPipeline;

  return {
    pipeline,
    useLegacy: pipeline === 'legacy',
    isProd: env.NODE_ENV === 'production'
  };
};
