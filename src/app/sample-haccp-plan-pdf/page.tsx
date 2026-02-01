export const metadata = {
  title: 'Sample HACCP Plan PDF',
  description: 'Preview a sample HACCP plan PDF in your browser.',
};

const SAMPLE_PDF_URL = '/api/export/sample/pdf';

export default function SampleHaccpPlanPdfPage() {
  const viewerUrl = `/pdfjs-viewer.html?file=${encodeURIComponent(SAMPLE_PDF_URL)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">
            Sample HACCP Plan PDF
          </h1>
          <p className="text-slate-600 mt-2 text-sm md:text-base">
            Preview the full document below. Export to remove watermark.
          </p>
        </header>

        <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <iframe
            title="Sample HACCP Plan PDF Preview"
            src={viewerUrl}
            className="w-full min-h-[70vh] md:min-h-[80vh]"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
