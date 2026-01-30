const DEFAULT_PDF_PIPELINE = "docx";

const normalizePdfPipeline = (value) => {
  if (!value) {
    return DEFAULT_PDF_PIPELINE;
  }

  const normalized = String(value).toLowerCase();
  if (normalized === "docx" || normalized === "legacy") {
    return normalized;
  }

  console.warn(
    `[pdf] Unrecognized EXPORT_PDF_PIPELINE="${value}", defaulting to "${DEFAULT_PDF_PIPELINE}".`
  );
  return DEFAULT_PDF_PIPELINE;
};

const getPdfPipeline = (override) =>
  normalizePdfPipeline(override ?? process.env.EXPORT_PDF_PIPELINE);

module.exports = {
  DEFAULT_PDF_PIPELINE,
  normalizePdfPipeline,
  getPdfPipeline,
};
