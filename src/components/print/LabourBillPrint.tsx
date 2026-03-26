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

interface LabourBillPrintProps {
  data: any;
  company?: any;
}

export const LabourBillPrint = forwardRef<HTMLDivElement, LabourBillPrintProps>(({ data, company }, ref) => {
  const metaDetails = [
    { label: data.billType === 'estimation' ? 'Estimation No' : 'Labour Bill No', value: data.billNo || 'N/A' },
    { label: 'Vehicle No', value: data.vehicleNumber || 'N/A' },
    { label: 'Job Card Ref', value: data.jobCardNo || 'N/A' }
  ];

  const headers = ['No', 'Service Description', 'Amount (₹)'];
  const rows = (data.items || []).map((item: any, idx: number) => [
    idx + 1,
    item.description,
    item.amount.toLocaleString()
  ]);

  const totals = [
    { label: 'Labour Charges Subtotal', value: `₹${(data.labourTotal || 0).toLocaleString()}` },
    { label: 'Discount Amount', value: `- ₹${(data.discount || 0).toLocaleString()}` },
    { label: 'Taxable Service Value', value: `₹${(data.taxable || 0).toLocaleString()}`, isTotal: true }
  ];

  return (
    <div ref={ref} >
      <PrintLayout>
        <DocumentHeader 
          title="Labour Bill Summary"
          company={company}
          customer={{
            name: data.customerName || 'Customer',
            phone: data.phoneNumber || 'N/A',
            address: data.address
          }}
          metaDetails={metaDetails}
          date={data.billDate}
        />

        <SectionHeader title="Service Details & Labour Breakout" />
        <PrintTable headers={headers} rows={rows} widths={['10%', '65%', '25%']} />

        <PrintSummary totals={totals} />

        <SignatureBlock />

        <PrintFooter company={company} />
      </PrintLayout>
    </div>
  );
});

LabourBillPrint.displayName = 'LabourBillPrint';
export default LabourBillPrint;
