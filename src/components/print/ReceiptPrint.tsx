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

interface ReceiptPrintProps {
  data: any;
  company?: any;
}

export const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(({ data, company }, ref) => {
  const metaDetails = [
    { label: 'Receipt ID', value: data.receiptNo || 'N/A' },
    { label: 'Payment Method', value: data.method || 'CASH' }
  ];

  const headers = ['Description', 'Amount'];
  const rows = [
    ['Payment Received For', data.particulars || '-'],
    ['Reference Number', data.refNo || 'N/A']
  ];

  const totals = [
    { label: 'Subtotal Amount', value: `₹${(data.amount || 0).toLocaleString()}` },
    { label: 'Total Received', value: `₹${(data.amount || 0).toLocaleString()}`, isTotal: true }
  ];

  const paymentInfo = [
    { label: 'Notes', content: data.remarks || 'No specific remarks.' }
  ];

  return (
    <div ref={ref} >
      <PrintLayout>
        <DocumentHeader 
          title="Payment Receipt"
          company={company}
          customer={{
            name: data.customerName || 'Customer',
            phone: data.phoneNumber || 'N/A',
            address: data.address
          }}
          metaDetails={metaDetails}
          date={data.date}
        />

        <SectionHeader title="Receipt Details" />
        <PrintTable headers={headers} rows={rows} widths={['70%', '30%']} />

        <PrintSummary totals={totals} paymentInfo={paymentInfo} />

        <SignatureBlock />

        <PrintFooter company={company} />
      </PrintLayout>
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';
export default ReceiptPrint;
