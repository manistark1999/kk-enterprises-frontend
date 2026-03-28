import { toast } from 'sonner';
import * as XLSX from 'xlsx';

/**
 * Universal Data Export Utility
 */

export interface ExportOptions {
  fileName?: string;
  sheetName?: string;
  format?: 'csv' | 'xlsx' | 'json';
  headers?: string[];
}

/**
 * Export array of objects to CSV/Excel
 */
export const exportData = (data: any[], options: ExportOptions = {}) => {
  const { 
    fileName = `export-${new Date().getTime()}`, 
    sheetName = 'Data', 
    format = 'csv',
    headers
  } = options;

  if (!data || data.length === 0) {
    toast.error('No data available to export');
    return;
  }

  try {
    // If headers provided, we might want to map keys to headers
    // but for simplicity, we'll let XLSX handle it or use the data as is
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add custom headers if provided
    if (headers && headers.length > 0) {
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    if (format === 'csv') {
      XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
    } else if (format === 'xlsx') {
      XLSX.writeFile(workbook, `${fileName}.xlsx`, { bookType: 'xlsx' });
    } else {
      // JSON fallback
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${fileName}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }

    toast.success(`Data exported successfully as ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export data');
  }
};

/**
 * Helper to download a string as a file
 */
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
};
