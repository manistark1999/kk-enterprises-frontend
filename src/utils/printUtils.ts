/**
 * Print Utilities - Updated to match Job Card Template Standard
 * 
 * All print layouts follow the KK ENTERPRISES standard template design
 */

import { toast } from 'sonner';

/**
 * Print current page content only
 */
export const handlePrintPage = (pageName: string = 'Document') => {
  try {
    document.body.classList.add('printing');
    const originalTitle = document.title;
    document.title = `${pageName} - KK Enterprises`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
      document.body.classList.remove('printing');
    }, 100);
  } catch (error) {
    toast.error('Failed to print page');
    console.error('Print error:', error);
    document.body.classList.remove('printing');
  }
};

/**
 * Print data interface for professional template
 */
export interface PrintData {
  header: {
    documentTitle: string;
    documentNumber?: string;
    documentDate?: string;
  };
  companyInfo?: {
    name: string;
    address1: string;
    address2: string;
    phone?: string;
    email?: string;
    gst?: string;
  };
  customerInfo?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  vehicleInfo?: {
    vehicleNumber?: string;
    vehicleMake?: string;
    vehicleModel?: string;
  };
  serviceInfo?: {
    serviceType?: string;
    technician?: string;
    date?: string;
    time?: string;
  };
  columns: Array<{
    header: string;
    key: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
  }>;
  data: Array<Record<string, string | number>>;
  billingDetails?: Array<{
    description: string;
    amount: number;
  }>;
  totals?: {
    subtotal?: number;
    tax?: number;
    taxLabel?: string;
    discount?: number;
    total: number;
    currency?: string;
  };
  notes?: string;
  additionalInfo?: string;
}

/**
 * Generate HTML for professional print template matching Job Card design
 */
const generatePrintHTML = (printData: PrintData, logoDataUrl?: string): string => {
  const {
    header,
    companyInfo = {
      name: 'KK Enterprises',
      address1: 'Shanmuga Nagar, Attanthangal Village',
      address2: 'Chennai, Tamil Nadu - 600052'
    },
    customerInfo,
    vehicleInfo,
    serviceInfo,
    columns,
    data,
    billingDetails,
    totals,
    notes,
    additionalInfo
  } = printData;

  // Format currency
  const formatCurrency = (amount: number, currency: string = '₹') => {
    return `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Build table rows
  const tableRows = data.map((row, index) => `
    <tr>
      ${columns.map(col => `
        <td style="text-align: ${col.align || 'left'};">
          ${row[col.key] || ''}
        </td>
      `).join('')}
    </tr>
  `).join('');

  // Auto-detect extra fields based on document type
  let isSalesPurchase = header.documentTitle.toLowerCase().includes('purchase') || header.documentTitle.toLowerCase().includes('sales');

  // Build complete HTML document
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>${header.documentTitle} - ${header.documentNumber || ''}</title>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: Arial, sans-serif; 
        font-size: 13px;
        color: #000;
        background: white;
        padding: 40px;
        max-width: 1000px;
        margin: 0 auto;
      }
      
      .top-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .customer-details h4 {
        margin-bottom: 10px;
        font-weight: bold;
        font-size: 14px;
      }
      .customer-details div {
        line-height: 1.5;
        font-size: 13px;
      }

      .document-meta {
        text-align: right;
        min-width: 250px;
      }
      .doc-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: auto auto;
        gap: 8px 20px;
        text-align: right;
        margin-bottom: 15px;
        font-size: 13px;
      }
      .meta-grid .label {
        color: #555;
      }
      .meta-grid .val {
        font-weight: normal;
      }

      .barcode-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .barcode {
        font-family: 'Libre Barcode 39 Text', cursive;
        font-size: 44px;
        line-height: 1;
        margin-top: 5px;
      }

      .vehicle-section {
        border-top: 2px solid #000;
        border-bottom: 2px solid #000;
        padding: 15px 5px;
        margin-bottom: 30px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }
      
      .vehicle-grid-col {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 5px 15px;
        align-items: start;
      }
      .v-label {
        font-weight: bold;
        font-size: 12px;
        color: #000;
      }
      .v-val {
        font-size: 12px;
      }

      /* ITEMS TABLE */
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-bottom: 30px;
      }
      th { 
        background-color: #333; 
        color: white;
        font-weight: bold;
        font-size: 13px;
        padding: 8px 10px;
        border-bottom: 2px solid #000;
      }
      td { 
        padding: 8px 10px; 
        font-size: 13px;
        border-bottom: 1px solid #ddd;
      }

      .billing-table th { background: #555; }
      
      .notes-section {
        margin-top: 30px;
        padding-top: 10px;
        border-top: 1px solid #000;
      }
      .notes-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .notes-content {
        line-height: 1.5;
        white-space: pre-line;
      }

      .total-section {
        width: 40%;
        float: right;
        border-top: 2px solid #000;
        padding-top: 10px;
        margin-bottom: 30px;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
      .total-row.grand {
        font-weight: bold;
        border-top: 1px dashed #000;
        padding-top: 8px;
        font-size: 16px;
      }
      
      .clearfix::after {
        content: "";
        clear: both;
        display: table;
      }

      .footer-signature {
        margin-top: 80px;
        display: flex;
        justify-content: space-between;
      }
      .sig-line {
        width: 200px;
        border-top: 1px solid #000;
        text-align: center;
        padding-top: 5px;
        font-style: italic;
      }

      @media print {
        @page { size: A4 portrait; margin: 15mm; }
        body { padding: 0; max-width: 100%; font-size: 12pt; }
        .vehicle-section { page-break-inside: avoid; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    <!-- Top Details -->
    <div class="top-section">
      <div class="customer-details">
        <h4>${customerInfo?.name ? 'Customer:' : 'Company Details:'}</h4>
        ${customerInfo?.name ? `
            <div style="font-weight: bold;">${customerInfo?.name || ''}</div>
            ${customerInfo?.address ? `<div>${customerInfo.address.replace(/\\n/g, '<br/>')}</div>` : ''}
            ${customerInfo?.phone ? `<div>${customerInfo.phone}</div>` : ''}
            ${customerInfo?.email ? `<div>${customerInfo.email}</div>` : ''}
        ` : `
            <div style="font-weight: bold;">${companyInfo?.name || ''}</div>
            <div>${companyInfo?.address1 || ''}</div>
            <div>${companyInfo?.address2 || ''}</div>
            ${companyInfo?.phone ? `<div>${companyInfo.phone}</div>` : ''}
            ${companyInfo?.gst ? `<div>GST: ${companyInfo.gst}</div>` : ''}
        `}
      </div>

      <div class="document-meta">
        <div class="doc-title">${header.documentTitle}</div>
        
        <div class="meta-grid">
          ${header?.documentDate ? `
            <div class="label">Date</div>
            <div class="val">${header.documentDate}</div>
          ` : ''}
          ${header?.documentNumber ? `
            <div class="label">${header.documentTitle} #</div>
            <div class="val">${header.documentNumber}</div>
          ` : ''}
        </div>
        
        ${header?.documentNumber ? `
          <div class="barcode-container">
            <div class="barcode">*${header.documentNumber}*</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Middle Vehicle Grid -->
    ${vehicleInfo && (vehicleInfo.vehicleNumber || vehicleInfo.vehicleMake) ? `
      <div class="vehicle-section">
        <div class="vehicle-grid-col">
          <div class="v-label">Registration</div><div class="v-val">${vehicleInfo.vehicleNumber || '-'}</div>
          <div class="v-label">Make</div><div class="v-val">${vehicleInfo.vehicleMake || '-'}</div>
          <div class="v-label">Model</div><div class="v-val">${vehicleInfo.vehicleModel || '-'}</div>
        </div>
        <div class="vehicle-grid-col">
          <div class="v-label">Service Type</div><div class="v-val">${serviceInfo?.serviceType || '-'}</div>
          <div class="v-label">Technician</div><div class="v-val">${serviceInfo?.technician || '-'}</div>
          <div class="v-label">Time</div><div class="v-val">${serviceInfo?.time || '-'}</div>
        </div>
        <div class="vehicle-grid-col">
           <!-- Dynamic placeholders for scale matching -->
          <div class="v-label">Engine #</div><div class="v-val">-</div>
          <div class="v-label">Chassis #</div><div class="v-val">-</div>
        </div>
      </div>
    ` : ''}

    <!-- Items Table -->
    ${data && data.length > 0 ? `
      <table>
        <thead>
          <tr>
            ${columns.map(col => `
              <th style="text-align: ${col.align || 'left'}; ${col.width ? `width: ${col.width};` : ''}">
                ${col.header}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    ` : ''}

    <div class="clearfix">
      <!-- Billing Details / Totals right side -->
      ${(billingDetails && billingDetails.length > 0) || totals ? `
        <div class="total-section">
          ${billingDetails ? billingDetails.map(detail => `
            <div class="total-row">
              <span>${detail.description}</span>
              <span>${formatCurrency(detail.amount)}</span>
            </div>
          `).join('') : ''}
          
          ${totals ? `
            ${totals.subtotal !== undefined ? `
              <div class="total-row">
                <span>Subtotal</span>
                <span>${formatCurrency(totals.subtotal || 0, totals.currency)}</span>
              </div>
            ` : ''}
            ${totals.tax !== undefined ? `
              <div class="total-row">
                <span>${totals.taxLabel || 'Tax'}</span>
                <span>${formatCurrency(totals.tax || 0, totals.currency)}</span>
              </div>
            ` : ''}
            ${totals.discount !== undefined ? `
              <div class="total-row">
                <span>Discount</span>
                <span>-${formatCurrency(totals.discount || 0, totals.currency)}</span>
              </div>
            ` : ''}
            <div class="total-row grand">
              <span>Total Amount</span>
              <span>${formatCurrency(totals.total || 0, totals.currency)}</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>

    <!-- Notes -->
    ${notes || additionalInfo ? `
      <div class="notes-section">
        <div class="notes-title">Notes / Remarks</div>
        <div class="notes-content">
          ${notes ? notes + '<br/><br/>' : ''}
          ${additionalInfo || ''}
        </div>
      </div>
    ` : ''}

    <!-- Signature Footer -->
    <div class="footer-signature">
      <div class="sig-line">Customer Signature</div>
      <div class="sig-line">Authorized Signatory</div>
    </div>
  </body>
</html>
  `;
};

/**
 * Load company logo as base64
 */
const loadLogoAsBase64 = (): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      // Silent timeout - logo is optional
      resolve('');
    }, 2000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(img, 0, 0);
          const logoBase64 = canvas.toDataURL('image/png');
          resolve(logoBase64);
        } else {
          resolve('');
        }
      } catch (error) {
        // Silent error - logo is optional
        resolve('');
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      // Silent error - logo is optional
      resolve('');
    };

    img.src = '/logo.png';
  });
};

/**
 * Print using professional template - STANDARD for all documents
 */
export const handlePrintWithTemplate = async (printData: PrintData) => {
  try {
    // Load logo
    const logoDataUrl = await loadLogoAsBase64();
    
    // Generate the complete HTML
    const htmlContent = generatePrintHTML(printData, logoDataUrl);
    
    // Open a new window
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error('Please allow popups to print. Check your browser settings.');
      return;
    }

    // Write the HTML content
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 250);
    
  } catch (error) {
    toast.error('Failed to open print window');
    console.error('Print error:', error);
  }
};

/**
 * Print specific element by ID
 */
export const handlePrintElement = (elementId: string, pageName: string = 'Document') => {
  try {
    const element = document.getElementById(elementId);
    
    if (!element) {
      toast.error('Content not found for printing');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }
    
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pageName} - KK Enterprises</title>
          <style>
            ${styles}
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              @page {
                margin: 1cm;
              }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
    
  } catch (error) {
    toast.error('Failed to print content');
    console.error('Print error:', error);
  }
};

/**
 * Check if browser supports print
 */
export const isPrintSupported = (): boolean => {
  return typeof window !== 'undefined' && 'print' in window;
};