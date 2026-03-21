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

interface JobCardPrintViewProps {
  data: any;
  company: any;
}

const JobCardPrintView: React.FC<JobCardPrintViewProps> = ({ data, company }) => {
  // Format table rows
  const serviceRows = (data.serviceItems || []).map((item: any, index: number) => [
    index + 1,
    item.serviceName || item.item || '-',
    item.quantity || 1,
    `₹${(parseFloat(item.rate) || 0).toFixed(2)}`,
    `${item.gst || 0}%`,
    `₹${(parseFloat(item.amount) || 0).toFixed(2)}`
  ]);

  const totals = [
    { label: 'Labour Charge', value: `₹${(parseFloat(data.labourCharge) || 0).toFixed(2)}` },
    { label: 'Parts Charge', value: `₹${(parseFloat(data.partsCharge) || 0).toFixed(2)}` },
    { label: 'Total Amount', value: `₹${(parseFloat(data.totalAmount) || 0).toFixed(2)}`, isTotal: true }
  ];

  const metaDetails = [
    { label: 'Vehicle Number', value: data.vehicleNumber || '-' },
    { label: 'Make/Model', value: `${data.vehicleMake || ''} ${data.vehicleModel || ''}` },
    { label: 'KM Reading', value: data.kmReading || '-' },
    { label: 'Service Type', value: data.serviceType || '-' }
  ];

  return (
    <PrintLayout>
      <DocumentHeader 
        title="JOB CARD" 
        docNumber={data.jobCardNo}
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

      <SectionHeader title="Service Details & Items" />
      <PrintTable 
        headers={['S.No', 'Service/Item Name', 'Qty', 'Rate', 'GST', 'Amount']}
        rows={serviceRows}
        widths={['8%', '45%', '10%', '12%', '10%', '15%']}
      />

      {data.problemReported && (
        <div className="mb-6">
          <SectionHeader title="Problem Reported" />
          <p className="text-sm p-2 bg-gray-50 border border-gray-100 rounded">{data.problemReported}</p>
        </div>
      )}

      {data.workDone && (
        <div className="mb-6">
          <SectionHeader title="Work Performed" />
          <p className="text-sm p-2 bg-gray-50 border border-gray-100 rounded">{data.workDone}</p>
        </div>
      )}

      <PrintSummary 
        totals={totals}
        paymentInfo={[
          { label: 'Remarks', content: data.remarks || 'No additional remarks.' },
          { label: 'Technician', content: data.technicianName || '-' }
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

export default JobCardPrintView;
