/**
 * System Integration Utilities
 * 
 * This file contains utility functions for cross-module data synchronization
 * and integration across the KK Enterprises Workshop Management System
 */

// Auto-generate unique IDs with prefixes
export const generateId = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
};

// Format date for consistent display
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Format currency for Indian Rupees
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Calculate GST amounts
export const calculateGST = (amount: number, gstRate: number = 18) => {
  const gstAmount = (amount * gstRate) / 100;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const totalWithGST = amount + gstAmount;
  
  return {
    baseAmount: amount,
    gstRate,
    cgst,
    sgst,
    totalGST: gstAmount,
    totalAmount: totalWithGST
  };
};

// Validate GST Number
export const validateGSTNumber = (gstNo: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNo);
};

// Validate Mobile Number
export const validateMobileNumber = (mobile: string): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

// Validate Email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get current financial year
export const getCurrentFinancialYear = (): string => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 0-indexed
  
  if (currentMonth >= 4) {
    return `${currentYear}-${(currentYear + 1).toString().substring(2)}`;
  } else {
    return `${currentYear - 1}-${currentYear.toString().substring(2)}`;
  }
};

// Generate invoice/bill number with auto-increment
export const generateInvoiceNumber = (prefix: string, lastNumber: number = 0): string => {
  const fy = getCurrentFinancialYear();
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `${prefix}/${fy}/${nextNumber}`;
};

// Calculate item total
export const calculateItemTotal = (quantity: number, rate: number, discount: number = 0): number => {
  const subtotal = quantity * rate;
  const discountAmount = (subtotal * discount) / 100;
  return subtotal - discountAmount;
};

// Export data to CSV
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Print functionality
export const printDocument = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) return;
  
  printWindow.document.write('<html><head><title>Print</title>');
  printWindow.document.write('<style>');
  printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
  printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
  printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
  printWindow.document.write('th { background-color: #f2f2f2; }');
  printWindow.document.write('</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(element.innerHTML);
  printWindow.document.write('</body></html>');
  
  printWindow.document.close();
  printWindow.print();
};

// Filter data by date range
export const filterByDateRange = <T extends { createdAt: string }>(
  data: T[],
  fromDate: string,
  toDate: string
): T[] => {
  if (!fromDate || !toDate) return data;
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999); // Include full end date
  
  return data.filter(item => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= from && itemDate <= to;
  });
};

// Search in multiple fields
export const searchInFields = <T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] => {
  if (!searchTerm) return data;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return data.filter(item =>
    fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearchTerm);
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    })
  );
};

// Sort data by field
export const sortByField = <T>(
  data: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });
};

// Sync data across modules (called when master data changes)
export const syncMasterDataAcrossModules = () => {
  // Trigger re-render of dependent components
  window.dispatchEvent(new CustomEvent('masterDataUpdated'));
};

// Calculate stock value
export const calculateStockValue = (quantity: number, rate: number): number => {
  return quantity * rate;
};

// Get low stock items
export const getLowStockItems = (items: any[], threshold: number = 10) => {
  return items.filter(item => item.quantity <= threshold);
};

// Calculate aging (days since creation)
export const calculateAging = (createdAt: string): number => {
  const created = new Date(createdAt);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Backup data to JSON
export const backupToJSON = (dataKey: string): void => {
  const data = localStorage.getItem(dataKey);
  if (!data) return;
  
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${dataKey}_backup_${Date.now()}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Restore data from JSON
export const restoreFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Module integration status check
export const checkModuleIntegration = () => {
  const modules = {
    masters: ['vehicleMakes', 'workTypes', 'workGroups', 'suppliers', 'transports'],
    transactions: ['labourBills', 'estimations', 'receipts', 'payments', 'purchases', 'sales', 'expenses'],
    inventory: ['stockItems', 'stockAdjustments'],
    accounts: ['cashRegister', 'bankAccounts']
  };
  
  const status: Record<string, boolean> = {};
  
  Object.entries(modules).forEach(([category, keys]) => {
    keys.forEach(key => {
      status[key] = localStorage.getItem(key) !== null;
    });
  });
  
  return status;
};
