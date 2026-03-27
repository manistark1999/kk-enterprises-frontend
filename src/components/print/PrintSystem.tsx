import React, { ReactNode } from 'react';
import './print-system.css';
// Root-absolute path from public/ for cross-context reliability (Print, PDF)
const kkPrintLogo = '/kk-groups-logo-header-print.png';

// Master Print Layout Component
export interface PrintLayoutProps {
  children: ReactNode;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ children }) => {
  return (
    <div className="print-container">
      <div className="print-preview-container">
        {children}
      </div>
    </div>
  );
};

// Document Header Component
export interface DocumentHeaderProps {
  title: string;
  docNumber?: string;
  date?: string;
  customer?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  company?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  metaDetails?: { label: string; value: string }[];
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  title,
  docNumber,
  date,
  customer,
  company,
  metaDetails = []
}) => {
  return (
    <div className="print-doc-header border-b-2 border-black pb-6 mb-8">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <img src={kkPrintLogo} alt="KK Groups Logo" className="w-16 h-16 object-contain shadow-md" />
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">{company?.name || 'KK ENTERPRISES'}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Automobile Workshop & Service Matrix</p>
            <div className="text-[11px] mt-2 font-medium text-gray-600 leading-tight">
              <p>{company?.address || 'Shanmuga Nagar, Attanthangal Village, Chennai - 52'}</p>
              <p>Phone: {company?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-black text-white px-8 py-2 mb-2">
            <h2 className="text-2xl font-black tracking-widest italic text-white uppercase">{title}</h2>
          </div>
          <div className="text-xs font-bold space-y-0.5">
            {docNumber && <p className="flex justify-between gap-4 uppercase">Ref No: <span>{docNumber}</span></p>}
            {date && <p className="flex justify-between gap-4 uppercase">Date: <span>{date}</span></p>}
          </div>
        </div>
      </div>

      <div className="print-header-grid">
        <div className="print-info-block">
          <span className="print-info-label">Customer Bill To:</span>
          <div className="font-bold text-base mb-1">{customer?.name || '-'}</div>
          {customer?.address && <div>{customer.address}</div>}
          {customer?.phone && <div>Phone: {customer.phone}</div>}
          {customer?.email && <div>Email: {customer.email}</div>}
        </div>

        <div className="print-info-block text-right">
          <span className="print-info-label">From Company:</span>
          <div className="font-bold text-base mb-1">{company?.name || 'KK Enterprises'}</div>
          {company?.address && <div>{company.address}</div>}
          {company?.phone && <div>Phone: {company.phone}</div>}
          {company?.email && <div>Email: {company.email}</div>}
          {company?.website && <div>{company.website}</div>}
        </div>
      </div>

      <div className="print-meta-grid">
        {date && (
          <div className="print-meta-item">
            <span className="print-meta-label">Date of {title}</span>
            <span>{date}</span>
          </div>
        )}
        {metaDetails.map((meta, idx) => (
          <div key={idx} className="print-meta-item">
            <span className="print-meta-label">{meta.label}</span>
            <span>{meta.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Content Section Header
export const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="print-section-header">{title}</h2>
);

// Printable Table Components
export interface PrintTableProps {
  headers: string[];
  rows: any[][];
  widths?: string[];
}

export const PrintTable: React.FC<PrintTableProps> = ({ headers, rows, widths }) => {
  return (
    <div className="print-table-section">
      <table className="print-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={widths ? { width: widths[i] } : {}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="text-center py-4 text-gray-400">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Summary & Payment Info
export interface SummaryProps {
  totals: { label: string; value: string; isTotal?: boolean }[];
  paymentInfo?: { label: string; content: string }[];
  bankDetails?: { label: string; value: string }[];
}

export const PrintSummary: React.FC<SummaryProps> = ({ totals, paymentInfo = [], bankDetails = [] }) => {
  return (
    <div className="print-bottom-layout">
      <div className="print-summary-container">
        <div className="print-summary-box">
          {totals.map((total, idx) => (
            <div key={idx} className={`print-summary-row ${total.isTotal ? 'total' : ''}`}>
              <span>{total.label}</span>
              <span>{total.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="print-details-grid">
        <div className="print-info-block">
          <h4 className="print-details-header">Payment Information</h4>
          {paymentInfo.map((p, i) => (
            <div key={i} className="mb-2">
              <span className="font-semibold block">{p.label}</span>
              <p className="text-gray-600">{p.content}</p>
            </div>
          ))}
        </div>

        <div className="print-info-block">
          <h4 className="print-details-header">Bank Details</h4>
          {bankDetails.map((b, i) => (
            <div key={i} className="flex justify-between border-b border-gray-100 py-1">
              <span className="font-semibold">{b.label}:</span>
              <span>{b.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Signature Block
export const SignatureBlock: React.FC = () => {
  return (
    <div className="print-signature-section">
      <div className="print-signature-box">
        <div className="print-signature-line"></div>
        <span className="print-signature-label">Customer Signature</span>
      </div>
      <div className="print-signature-box">
        <div className="print-signature-line"></div>
        <span className="print-signature-label">Authorized Signatory</span>
      </div>
    </div>
  );
};

// Master Footer Component (3 columns)
export interface PrintFooterProps {
  company?: any;
}

export const PrintFooter: React.FC<PrintFooterProps> = ({ company }) => {
  return (
    <div className="print-bottom-bar no-print-background">
      <div className="print-bottom-bar-col">
        <strong>Company</strong>
        <p>{company?.name || 'KK Enterprises'}</p>
        <p>{company?.address || '-'}</p>
        <p>{company?.city || '-'}</p>
      </div>
      <div className="print-bottom-bar-col">
        <strong>Information</strong>
        <p>Email: {company?.email || '-'}</p>
        <p>Website: {company?.website || '-'}</p>
        <p>VAT Number: {company?.gstNo || '-'}</p>
      </div>
      <div className="print-bottom-bar-col">
        <strong>Bank</strong>
        <p>Bank: {company?.bankName || '-'}</p>
        <p>Account: {company?.accountNo || '-'}</p>
        <p>IFSC: {company?.ifscCode || '-'}</p>
      </div>
    </div>
  );
};
