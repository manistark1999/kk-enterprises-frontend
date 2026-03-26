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

interface AlignmentPrintProps {
  data: any;
  company?: any;
}

export const AlignmentPrint = forwardRef<HTMLDivElement, AlignmentPrintProps>(({ data, company }, ref) => {
  const metaDetails = [
    { label: 'Bill No', value: data.billNo || 'N/A' },
    { label: 'Alignment Type', value: data.alignmentType || 'N/A' },
    { label: 'Technician', value: data.technician || 'N/A' }
  ];

  const headers = ['Service Description', 'Type', 'Amount (₹)'];
  const rows = [
    ['Wheel Alignment Service', data.alignmentType, data.charges?.toLocaleString() || '0']
  ];

  const totals = [
    { label: 'Net Alignment Charges', value: `₹${(data.charges || 0).toLocaleString()}`, isTotal: true }
  ];

  return (
    <div ref={ref} >
      <PrintLayout>
        <DocumentHeader 
          title="Alignment Service Report"
          company={company}
          customer={{
            name: data.customerName || 'Customer',
            phone: data.customerPhone || 'N/A',
            address: data.customerAddress
          }}
          metaDetails={metaDetails}
          date={data.date}
        />

        <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 mb-6">
           <h3 className="text-[10px] font-bold uppercase text-blue-500 mb-2">Vehicle Particulars</h3>
           <div className="grid grid-cols-2 gap-4 text-xs">
              <p><strong>Registration:</strong> {data.vehicleNo}</p>
              <p><strong>Make / Model:</strong> {data.vehicleMake}</p>
           </div>
        </div>

        <SectionHeader title="Service Details" />
        <PrintTable headers={headers} rows={rows} widths={['50%', '25%', '25%']} />

        <PrintSummary totals={totals} />

        <SignatureBlock />

        <PrintFooter company={company} />
      </PrintLayout>
    </div>
  );
});

AlignmentPrint.displayName = 'AlignmentPrint';
export default AlignmentPrint;
