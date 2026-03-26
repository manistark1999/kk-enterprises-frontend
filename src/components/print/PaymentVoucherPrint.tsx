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

interface PaymentVoucherPrintProps {
  data: any;
  company?: any;
}

export const PaymentVoucherPrint = forwardRef<HTMLDivElement, PaymentVoucherPrintProps>(({ data, company }, ref) => {
  const metaDetails = [
    { label: 'Voucher ID', value: data.voucherNo || 'N/A' },
    { label: 'Payment Method', value: data.method || 'CASH' }
  ];

  const headers = ['Particulars', 'Amount (₹)'];
  const rows = [
    [data.particulars || 'Service Settlement', data.amount.toLocaleString()]
  ];

  const totals = [
    { label: 'Total Payment Amount', value: `₹${(data.amount || 0).toLocaleString()}`, isTotal: true }
  ];

  return (
    <div ref={ref} >
      <PrintLayout>
        <DocumentHeader 
          title="Payment Voucher"
          company={company}
          customer={{
            name: data.payeeName || 'Payee',
            phone: data.phoneNumber || 'N/A',
            address: data.address
          }}
          metaDetails={metaDetails}
          date={data.date}
        />

        <SectionHeader title="Settlement Details" />
        <PrintTable headers={headers} rows={rows} widths={['75%', '25%']} />

        <PrintSummary totals={totals} />

        <div className="mt-8 flex justify-between px-10">
          <div className="text-center w-40">
            <div className="border-b border-black pt-12"></div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Receiver's Sign</span>
          </div>
          <div className="text-center w-40">
            <div className="border-b border-black pt-12"></div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Accountant Sign</span>
          </div>
        </div>

        <PrintFooter company={company} />
      </PrintLayout>
    </div>
  );
});

PaymentVoucherPrint.displayName = 'PaymentVoucherPrint';
export default PaymentVoucherPrint;
