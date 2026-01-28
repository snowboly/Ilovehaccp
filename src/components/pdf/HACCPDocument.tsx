import React from "react";
import { HACCPDocumentModular } from "@/lib/export/pdf/renderPdf";
import { buildExportDoc } from "@/lib/export/exportDoc";

interface Props {
  logo?: string | null;
  template?: string;
  data: any;
  dict: any;
}

const HACCPDocument = ({ data, dict, logo, template }: Props) => {
  const doc = buildExportDoc({
    data,
    dict,
    lang: data?.lang || "en",
    logoDataUri: logo ?? null,
    template,
  });
  return <HACCPDocumentModular doc={doc} />;
};

export default HACCPDocument;
