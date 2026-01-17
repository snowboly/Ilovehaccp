import React from 'react';
import { getTheme } from '@/lib/export/getTheme';
import { HACCPDocumentModular } from '@/lib/export/pdf/renderPdf';

interface Props {
  logo?: string | null;
  template?: string;
  data: any;
  dict: any;
}

const HACCPDocument = ({ data, dict, logo, template }: Props) => {
  const theme = getTheme(template);
  return <HACCPDocumentModular data={data} dict={dict} logo={logo} theme={theme} />;
};

export default HACCPDocument;
