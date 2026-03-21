import React from 'react';
import { 
  PrintLayout, 
  DocumentHeader, 
  PrintSummary, 
  SignatureBlock, 
  PrintFooter,
  SectionHeader 
} from '@/components/print/PrintSystem';

interface ReceiptPrintViewProps {
  data: any;
  company: any;
}

const ReceiptPrintView: React.FC<ReceiptPrintViewProps> = ({ data, company }) => {
  const totals = [
    { label: 'Amount Received', value: `₹${(parseFloat(data.amount) || 0).toFixed(2)}`, isTotal: true }
  ];

  const metaDetails = [
    { label: 'Receipt Number', value: data.receiptNo || '-' },
    { label: 'Payment Mode', value: data.paymentMode || '-' },
    { label: 'Transaction ID', value: data.transactionId || '-' }
  ];

  return (
    <PrintLayout>
      <DocumentHeader 
        title="PAYMENT RECEIPT" 
        docNumber={data.receiptNo}
        date={data.date}
        customer={{
          name: data.customerName,
          phone: data.customerPhone,
          address: data.customerAddress
        }}
        company={{
          name: company.companyName,
          address: company.address,
          phone: company.phone,
          email: company.email,
          website: company.website
        }}
        metaDetails={metaDetails}
      />

      <div className="my-10 p-6 border-2 border-gray-100 rounded-lg">
        <SectionHeader title="Receipt Details" />
        <div className="grid grid-cols-1 gap-4 mt-4">
           <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-600 italic">Received with thanks from:</span>
              <span className="font-bold text-lg">{data.customerName}</span>
           </div>
           <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-600 italic">The sum of Rupees:</span>
              <span className="font-bold">{data.amountWords || '-'}</span>
           </div>
           <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-600 italic">Towards:</span>
              <span className="font-bold">{data.remarks || 'General Service / Bill Settlement'}</span>
           </div>
           <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-gray-600 italic">Against Bill No:</span>
              <span className="font-bold">{data.billNo || 'N/A'}</span>
           </div>
        </div>
      </div>

      <PrintSummary 
        totals={totals}
        paymentInfo={[
          { label: 'Note', content: 'This is a computer-generated receipt and does not require a physical signature unless asked.' }
        ]}
      />

      <SignatureBlock />
      
      <PrintFooter company={company} />
    </PrintLayout>
  );
};

export default ReceiptPrintView;
