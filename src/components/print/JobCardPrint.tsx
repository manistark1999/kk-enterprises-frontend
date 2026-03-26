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
import logo from '../../assets/images/kk-groups-logo-header-print.png';

export interface ServiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

export interface JobCardData {
  jobCardNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  kmReading: string;
  serviceType: string;
  workType: string;
  technicianName: string;
  problemReported: string;
  workDone: string;
  remarks: string;
  labourCharge: string | number;
  partsCharge: string | number;
  totalAmount: string | number;
  serviceItems: ServiceItem[];
  // Alignment details
  beforeFrontCamber?: string;
  beforeFrontCaster?: string;
  beforeFrontToe?: string;
  beforeRearCamber?: string;
  beforeRearToe?: string;
  afterFrontCamber?: string;
  afterFrontCaster?: string;
  afterFrontToe?: string;
  afterRearCamber?: string;
  afterRearToe?: string;
  processedBy?: string;
  processedById?: number | string;
}

interface JobCardPrintProps {
  data: JobCardData;
  company?: any;
}

export const JobCardPrint = forwardRef<HTMLDivElement, JobCardPrintProps>(({ data, company }, ref) => {
  const metaDetails = [
    { label: 'Job Card No', value: data.jobCardNo },
    { label: 'Time', value: data.time },
    { label: 'Service Type', value: data.serviceType }
  ];

  const headers = ['No', 'Item Description', 'Pieces', 'Price', 'Amount'];
  const rows = (data.serviceItems || []).map((item, index) => [
    index + 1,
    item.serviceName,
    item.quantity,
    `₹${Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `₹${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  ]);

  const subtotal = (data.serviceItems || []).reduce((acc, item) => acc + item.amount, 0);
  const labourCharge = Number(data.labourCharge) || 0;
  const partsCharge = Number(data.partsCharge) || 0;

  const totals = [
    { label: 'Service/Parts Subtotal', value: `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Labour Charges', value: `₹${labourCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Additional Parts', value: `₹${partsCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Total Payable Amount', value: `₹${Number(data.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, isTotal: true }
  ];

  return (
    <div ref={ref}>
      <PrintLayout>
        {/* Custom Header with black 'JOB CARD' box as per image */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
          <div className="flex gap-4 items-center">
            <img src={logo} alt="KK Groups Logo" className="w-16 h-16 object-contain shadow-md" />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">{company?.company_name || 'KK ENTERPRISES'}</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Automobile Workshop & Service Matrix</p>
              <div className="text-[11px] mt-2 font-medium text-gray-600 leading-tight">
                <p>{company?.address || 'Building No. 12, Industrial Area, Phase I'}</p>
                <p>Phone: {company?.phone || '+91 7558130111'}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-black text-white px-8 py-2 mb-2">
              <h2 className="text-2xl font-black tracking-widest italic text-white">JOB CARD</h2>
            </div>
            <div className="text-xs font-bold space-y-0.5">
              <p className="flex justify-between gap-4">Ref No: <span>{data.jobCardNo}</span></p>
              <p className="flex justify-between gap-4">Date: <span>{data.date}</span></p>
            </div>
          </div>
        </div>

        <SectionHeader title="Customer Information" />
        <div className="grid grid-cols-2 gap-8 mb-6 border-b border-gray-100 pb-6">
          <div>
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Bill To:</label>
            <div className="font-bold text-base">{data.customerName}</div>
            <div className="text-xs text-gray-600 mt-1">{data.customerAddress || 'N/A'}</div>
            <div className="text-blue-600 font-bold text-sm mt-1">{data.customerPhone}</div>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Vehicle Particulars:</label>
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <span className="font-bold">Registration:</span><span>{data.vehicleNumber}</span>
              <span className="font-bold">Make/Model:</span><span>{data.vehicleMake} {data.vehicleModel}</span>
              <span className="font-bold">KM Reading:</span><span>{data.kmReading}</span>
            </div>
          </div>
        </div>

        <SectionHeader title="Job Description & Notes" />
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 space-y-4">
            <div>
              <span className="font-bold block text-[10px] uppercase text-gray-400 mb-1">Problem Reported:</span>
              <p className="text-xs italic min-h-[3em] bg-gray-50 p-3 rounded-lg border border-gray-100">{data.problemReported || 'Standard diagnostic requested'}</p>
            </div>
            <div>
              <span className="font-bold block text-[10px] uppercase text-gray-400 mb-1">Technical Observation:</span>
              <p className="text-xs italic min-h-[3em] bg-gray-50 p-3 rounded-lg border border-gray-100">{data.workDone || 'Inspection in progress'}</p>
            </div>
          </div>
          <div className="border-l pl-6 space-y-4 border-gray-100">
            <div>
              <span className="font-bold block text-[10px] uppercase text-gray-400 mb-1">Designer in Charge:</span>
              <p className="font-black text-blue-900 text-lg leading-tight uppercase tracking-tighter">{data.processedBy || data.technicianName || 'N/A'}</p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <span className="font-bold block text-[10px] uppercase text-gray-400 mb-1">Current Status:</span>
              <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest italic rounded">SERVICE RECORD</div>
            </div>
          </div>
        </div>

        <PrintTable headers={headers} rows={rows} widths={['10%', '50%', '10%', '15%', '15%']} />

        <PrintSummary totals={totals} />

        <div className="grid grid-cols-2 gap-12 items-end mt-12 mb-8">
          <div className="text-center">
            <div className="border-b-2 border-black pb-2 mb-2 font-bold italic tracking-tighter">{data.customerName}</div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Customer Authorization</span>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-black pb-2 mb-2 font-black text-xl italic tracking-tighter">KK ENTERPRISES</div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Authorized Signature</span>
          </div>
        </div>

        <PrintFooter company={company} />
      </PrintLayout>
    </div>
  );
});

JobCardPrint.displayName = 'JobCardPrint';

export default JobCardPrint;
