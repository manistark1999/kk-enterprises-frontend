import React, { forwardRef } from 'react';
import { 
  PrintLayout, 
  DocumentHeader, 
  SectionHeader, 
  PrintTable, 
  PrintSummary,
  SignatureBlock,
  PrintFooter 
} from './PrintSystem';

interface EstimationPrintProps {
  data: any;
  company?: any;
}

export const EstimationPrint = forwardRef<HTMLDivElement, EstimationPrintProps>(({ data, company }, ref) => {
  const metaDetails = [
    { label: 'Estimation No', value: data.estimateNo || 'N/A' },
    { label: 'Vehicle', value: data.vehicleReg || 'N/A' },
    { label: 'Valid Until', value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() } // 7-day validity
  ];

  const headers = ['No', 'Item Description', 'Qty', 'Rate', 'Amount'];
  const rows = (data.items || []).map((item: any, idx: number) => [
    idx + 1,
    item.name,
    item.qty,
    `₹${item.rate.toLocaleString()}`,
    `₹${item.amount.toLocaleString()}`
  ]);

  const totals = [
    { label: 'Subtotal Amount', value: `₹${(data.subtotal || 0).toLocaleString()}` },
    { label: 'Tax Total', value: `₹${(data.tax || 0).toLocaleString()}` },
    { label: 'Grand Total Amount (EST)', value: `₹${(data.total || 0).toLocaleString()}`, isTotal: true }
  ];

  return (
    <div ref={ref} >
      <PrintLayout>
        <DocumentHeader 
          title="Service Estimation"
          company={company}
          customer={{
            name: data.customerName || 'Customer',
            phone: data.phone || 'N/A',
            address: data.address
          }}
          metaDetails={metaDetails}
          date={data.date}
        />

        <SectionHeader title="Estimated Service Items & Parts" />
        <PrintTable headers={headers} rows={rows} widths={['10%', '50%', '10%', '15%', '15%']} />

        <PrintSummary totals={totals} />

        <div className="mt-8 p-4 border rounded bg-yellow-50">
          <h4 className="font-bold text-sm mb-2 uppercase">Disclaimer</h4>
          <p className="text-xs text-gray-600">
            This is an estimated quote only. Final billing may vary based on exact parts consumed and actual labor hours. Estimation validity is 7 days from the document date.
          </p>
        </div>

        <SignatureBlock />

        <PrintFooter company={company} />
      </PrintLayout>
    </div>
  );
});

EstimationPrint.displayName = 'EstimationPrint';
export default EstimationPrint;
