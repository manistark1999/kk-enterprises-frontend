import React from 'react';
import { 
  PrintLayout, 
  DocumentHeader, 
  PrintTable, 
  PrintSummary, 
  SignatureBlock, 
  PrintFooter,
  SectionHeader 
} from '@/components/print/PrintSystem';

interface BillPrintViewProps {
  data: any;
  company: any;
  title?: string;
}

const BillPrintView: React.FC<BillPrintViewProps> = ({ data, company, title = 'INVOICE' }) => {
  // Format table rows
  const itemsRows = (data.items || []).map((item: any, index: number) => [
    index + 1,
    item.name || item.description || '-',
    item.quantity || 1,
    `₹${(parseFloat(item.rate) || 0).toFixed(2)}`,
    `${item.gst || 0}%`,
    `₹${(parseFloat(item.amount) || 0).toFixed(2)}`
  ]);

  const totals = [
    { label: 'Sub Total', value: `₹${(parseFloat(data.subTotal) || 0).toFixed(2)}` },
    { label: 'Tax Amount', value: `₹${(parseFloat(data.taxAmount) || 0).toFixed(2)}` },
    { label: 'Total Amount', value: `₹${(parseFloat(data.totalAmount) || 0).toFixed(2)}`, isTotal: true }
  ];

  const metaDetails = [
    { label: 'Bill Number', value: data.billNo || '-' },
    { label: 'Vehicle Number', value: data.vehicleNumber || '-' },
    { label: 'Reference No', value: data.refNo || '-' }
  ];

  return (
    <PrintLayout>
      <DocumentHeader 
        title={title} 
        docNumber={data.billNo}
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

      <SectionHeader title="Billing Items" />
      <PrintTable 
        headers={['S.No', 'Description', 'Qty', 'Rate', 'GST', 'Amount']}
        rows={itemsRows}
        widths={['8%', '45%', '10%', '12%', '10%', '15%']}
      />

      <PrintSummary 
        totals={totals}
        paymentInfo={[
          { label: 'Terms & Conditions', content: '1. Subject to local jurisdiction. 2. Goods once sold will not be taken back. 3. Warranty as per manufacturer norms.' }
        ]}
        bankDetails={[
          { label: 'Bank Name', value: company.bankName || '-' },
          { label: 'Account No', value: company.accountNo || '-' },
          { label: 'IFSC Code', value: company.ifscCode || '-' }
        ]}
      />

      <SignatureBlock />
      
      <PrintFooter company={company} />
    </PrintLayout>
  );
};

export default BillPrintView;
