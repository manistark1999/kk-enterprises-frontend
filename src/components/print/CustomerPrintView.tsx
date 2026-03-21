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

interface CustomerPrintViewProps {
  data: any;
  company: any;
}

const CustomerPrintView: React.FC<CustomerPrintViewProps> = ({ data, company }) => {
  return (
    <PrintLayout>
      <DocumentHeader 
        title="CUSTOMER PROFILE" 
        docNumber={data.id || 'NEW'}
        date={new Date().toLocaleDateString()}
        company={{
          name: company.companyName,
          address: company.address,
          phone: company.phone,
          email: company.email,
          website: company.website
        }}
      />

      <SectionHeader title="Customer Information" />
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Phone:</strong> {data.phone}</p>
          <p><strong>Email:</strong> {data.email || 'N/A'}</p>
        </div>
        <div>
          <p><strong>GST Number:</strong> {data.gstNumber || 'N/A'}</p>
          <p><strong>City:</strong> {data.city || 'N/A'}</p>
          <p><strong>State:</strong> {data.state || 'N/A'}</p>
        </div>
      </div>

      <SectionHeader title="Address" />
      <p className="text-sm mb-6">{data.address || 'No address provided'}</p>

      {data.vehicles && data.vehicles.length > 0 && (
        <>
          <SectionHeader title="Associated Vehicles" />
          <PrintTable 
            headers={['S.No', 'Vehicle Number', 'Make', 'Model', 'Year']}
            rows={data.vehicles.map((v: any, i: number) => [
              (i + 1).toString(),
              v.vehicleNumber,
              v.make,
              v.model,
              v.year || '-'
            ])}
          />
        </>
      )}

      <SignatureBlock />
      
      <PrintFooter company={company} />
    </PrintLayout>
  );
};

export default CustomerPrintView;
