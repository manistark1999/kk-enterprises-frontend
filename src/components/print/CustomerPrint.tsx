import React, { forwardRef } from 'react';
import { 
  PrintLayout, 
  DocumentHeader, 
  SectionHeader, 
  PrintTable, 
  PrintFooter 
} from './PrintSystem';

interface CustomerPrintProps {
  data: any;
  company?: any;
}

export const CustomerPrint = forwardRef<HTMLDivElement, CustomerPrintProps>(({ data, company }, ref) => {
  const metaDetails = [
    { label: 'Customer ID', value: data.customerCode || data.customer_code || `CUS-${data.id?.toString().padStart(4, '0')}` },
    { label: 'Type', value: data.customerType || 'Retail' },
    { label: 'Registered On', value: new Date(data.createdAt).toLocaleDateString() }
  ];

  const headers = ['Field', 'Information'];
  const rows = [
    ['Full Name', data.customerName || data.name],
    ['Phone Number', data.phoneNumber || data.phone],
    ['Email Address', data.email || 'N/A'],
    ['GST Number', data.gstNumber || 'N/A'],
    ['Address', data.address || 'N/A'],
    ['Credit Limit', `₹${(data.creditLimit || 0).toLocaleString()}`],
    ['Outstanding Balance', `₹${(data.balance || 0).toLocaleString()}`]
  ];

  return (
    <div ref={ref}>
      <PrintLayout>
        <DocumentHeader 
          title="Customer Profile"
          company={company}
          customer={{
            name: data.customerName || data.name,
            phone: data.phoneNumber || data.phone,
            address: data.address
          }}
          metaDetails={metaDetails}
        />

        <SectionHeader title="Detailed Customer Information" />
        <PrintTable headers={headers} rows={rows} widths={['30%', '70%']} />

        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h4 className="font-bold text-sm mb-2 uppercase">Compliance Note</h4>
          <p className="text-xs text-gray-600">
            This document confirms the current registration details of the aforementioned customer in the KK Enterprises Workshop Management System. All information is subject to periodic verification.
          </p>
        </div>

        <PrintFooter company={company} />
      </PrintLayout>
    </div>
  );
});

CustomerPrint.displayName = 'CustomerPrint';
export default CustomerPrint;
