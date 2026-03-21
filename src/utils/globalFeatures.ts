/**
 * Global Features Utilities
 * 
 * Implements three core features across the entire system:
 * 1. Page Refresh - Reload current page data
 * 2. Export to Excel - Download data as .xlsx
 * 3. Import Data - Upload and process Excel/CSV files
 */

import * as XLSX from 'xlsx';
import { toast } from 'sonner';

/**
 * 1. PAGE REFRESH FUNCTION
 * Reloads current page data without refreshing entire website
 */
export const handlePageRefresh = (
  refreshCallback: () => void,
  moduleName: string = 'Data'
) => {
  try {
    refreshCallback();
    toast.success(`${moduleName} refreshed successfully!`);
  } catch (error) {
    toast.error(`Failed to refresh ${moduleName}`);
    console.error('Refresh error:', error);
  }
};

/**
 * 2. EXPORT TO EXCEL FUNCTION
 * Converts table data to Excel file and downloads it
 */
export interface ExportColumn {
  header: string;
  key: string;
  format?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  width?: number;
}

export const exportToExcel = (
  data: any[],
  columns: ExportColumn[],
  fileName: string,
  sheetName: string = 'Sheet1'
) => {
  try {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Prepare data for Excel
    const excelData = data.map(row => {
      const excelRow: any = {};
      columns.forEach(col => {
        let value = row[col.key];
        
        // Format based on column type
        switch (col.format) {
          case 'currency':
            excelRow[col.header] = typeof value === 'number' 
              ? `₹${value.toFixed(2)}` 
              : value || '₹0.00';
            break;
          case 'number':
            excelRow[col.header] = typeof value === 'number' 
              ? value 
              : parseFloat(value) || 0;
            break;
          case 'date':
            excelRow[col.header] = value 
              ? new Date(value).toLocaleDateString('en-IN')
              : '';
            break;
          case 'percentage':
            excelRow[col.header] = typeof value === 'number'
              ? `${value}%`
              : value || '0%';
            break;
          default:
            excelRow[col.header] = value || '';
        }
      });
      return excelRow;
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = columns.map(col => ({
      wch: col.width || 15
    }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate file name with date
    const date = new Date().toISOString().split('T')[0];
    const fullFileName = `${fileName}_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fullFileName);

    toast.success(`Exported ${data.length} records successfully!`);
  } catch (error) {
    toast.error('Failed to export data');
    console.error('Export error:', error);
  }
};

/**
 * 3. IMPORT DATA FUNCTION
 * Reads and validates Excel/CSV files
 */
export interface ImportValidation {
  required: string[];
  optional?: string[];
  transforms?: {
    [key: string]: (value: any) => any;
  };
}

export const importFromExcel = async (
  file: File,
  validation: ImportValidation,
  onSuccess: (data: any[]) => void
): Promise<void> => {
  try {
    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload Excel (.xlsx) or CSV file');
      return;
    }

    // Read file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      toast.error('No data found in file');
      return;
    }

    // Validate columns
    const firstRow: any = jsonData[0];
    const fileColumns = Object.keys(firstRow);
    const missingColumns = validation.required.filter(
      col => !fileColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
      return;
    }

    // Transform data if needed
    const transformedData = jsonData.map((row: any) => {
      const transformed: any = { ...row };
      
      if (validation.transforms) {
        Object.keys(validation.transforms).forEach(key => {
          if (transformed[key] !== undefined) {
            transformed[key] = validation.transforms![key](transformed[key]);
          }
        });
      }
      
      return transformed;
    });

    // Call success callback
    onSuccess(transformedData);
    toast.success(`Imported ${transformedData.length} records successfully!`);

  } catch (error) {
    toast.error('Failed to import data');
    console.error('Import error:', error);
  }
};

/**
 * Global Button Classes
 * Consistent styling for Refresh, Export, Import buttons
 */
export const getGlobalButtonClass = (isDarkMode: boolean) => {
  return `flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
    isDarkMode
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;
};

export const getExportButtonClass = () => {
  return 'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium bg-green-600 text-white hover:bg-green-700';
};

export const getImportButtonClass = () => {
  return 'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium bg-blue-600 text-white hover:bg-blue-700';
};

/**
 * Global Action Buttons Component
 * Renders Refresh, Export, Import buttons in consistent layout
 */
export interface GlobalActionButtonsProps {
  isDarkMode: boolean;
  onRefresh: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  moduleName: string;
  showExport?: boolean;
  showImport?: boolean;
  customButtons?: React.ReactNode;
}
