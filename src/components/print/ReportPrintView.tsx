import React from 'react';
import { 
  PrintLayout, 
  DocumentHeader, 
  PrintTable, 
  PrintSummary, 
  SignatureBlock, 
  PrintFooter,
  SectionHeader 
} from './PrintSystem';

interface ReportPrintViewProps {
  data: any;
  company: any;
  title: string;
}

const ReportPrintView: React.FC<ReportPrintViewProps> = ({ data, company, title }) => {
  // Format table rows
  // Expecting data.items to be an array of objects
  // and data.headers to be an array of string headers
  // and data.keys to be an array of object keys
  
  const rows = (data.items || []).map((item: any, index: number) => {
    return data.keys.map((key: string) => {
      const value = item[key];
      const lowercaseKey = key.toLowerCase();
      if (typeof value === 'number' && (lowercaseKey.includes('amount') || lowercaseKey.includes('price') || lowercaseKey.includes('value'))) {
        return `₹${value.toLocaleString()}`;
      }
      return value || '-';
    });
  });

  return (
    <PrintLayout>
      <DocumentHeader 
        title={title.toUpperCase()} 
        docNumber={data.reportNo || `REP-${Date.now().toString().slice(-6)}`}
        date={data.date || new Date().toLocaleDateString()}
        company={{
          name: company.companyName,
          address: company.address,
          phone: company.phone,
          email: company.email,
          website: company.website
        }}
        metaDetails={data.metaDetails || []}
      />

      <SectionHeader title="Report Details" />
      <PrintTable 
        headers={data.headers || []}
        rows={rows}
        widths={data.widths}
      />

      {data.summary && (
        <PrintSummary 
          totals={data.summary.totals || []}
          paymentInfo={data.summary.info || []}
        />
      )}

      <SignatureBlock />
      
      <PrintFooter company={company} />
    </PrintLayout>
  );
};

export default ReportPrintView;
