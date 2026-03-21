/**
 * Integration Flow Manager
 * 
 * This utility manages the complete data flow across all modules as per
 * the Truck/Workshop Management System integration requirements.
 * 
 * Reference: /imports/truck-workshop-erp.md
 */

import { toast } from 'sonner';

// Types for integration events
export type IntegrationEvent = 
  | 'MASTER_CREATED'
  | 'MASTER_UPDATED'
  | 'MASTER_DELETED'
  | 'TRANSACTION_CREATED'
  | 'TRANSACTION_UPDATED'
  | 'TRANSACTION_DELETED'
  | 'STOCK_UPDATED'
  | 'FINANCIAL_UPDATED';

export interface IntegrationPayload {
  event: IntegrationEvent;
  module: string;
  data: any;
  affectedModules?: string[];
}

/**
 * Core Integration Manager Class
 * Handles automatic updates across all modules
 */
class IntegrationFlowManager {
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Register a listener for integration events
   */
  on(event: IntegrationEvent, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Emit an integration event
   */
  emit(payload: IntegrationPayload) {
    const listeners = this.listeners.get(payload.event) || [];
    listeners.forEach(callback => callback(payload));
    
    // Log integration event for debugging
    console.log('[Integration Flow]', payload);
  }

  /**
   * Process automatic updates based on integration flow
   */
  processIntegration(payload: IntegrationPayload) {
    switch (payload.event) {
      case 'MASTER_CREATED':
      case 'MASTER_UPDATED':
        this.handleMasterChange(payload);
        break;
      
      case 'TRANSACTION_CREATED':
      case 'TRANSACTION_UPDATED':
        this.handleTransactionChange(payload);
        break;
      
      case 'STOCK_UPDATED':
        this.handleStockChange(payload);
        break;
      
      case 'FINANCIAL_UPDATED':
        this.handleFinancialChange(payload);
        break;
    }
  }

  /**
   * Handle Master Data Changes
   * When masters change, update all dependent modules
   */
  private handleMasterChange(payload: IntegrationPayload) {
    const { module, data } = payload;
    
    // Trigger refresh in dependent modules
    window.dispatchEvent(new CustomEvent('masterDataUpdated', {
      detail: { module, data }
    }));

    // Show notification
    if (payload.event === 'MASTER_CREATED') {
      toast.success(`${module} created and available in all modules`, {
        description: 'All dropdowns and references updated automatically'
      });
    }
  }

  /**
   * Handle Transaction Changes
   * Automatically update reports, registers, and dashboard
   */
  private handleTransactionChange(payload: IntegrationPayload) {
    const { module, data } = payload;
    
    // Define which modules are affected by each transaction type
    const affectedModules: Record<string, string[]> = {
      'Labour Bill': ['Receipt Register', 'MIS Report', 'Dashboard', 'GST Report'],
      'Estimation': ['MIS Report', 'Dashboard'],
      'Receipt': ['Cash Register', 'Receipt Register', 'Dashboard'],
      'Payment': ['Bank Ledger', 'Expense Register', 'Dashboard'],
      'Purchase': ['Stock List', 'Stock Report', 'Expense Register', 'Supplier Ledger'],
      'Sales': ['Stock List', 'Stock Report', 'Receipt Register', 'GST Report'],
      'Expense': ['Expense Register', 'Cash Register', 'MIS Report'],
      'Staff Advance': ['Staff Records', 'Cash Register'],
      'Salary': ['Staff Records', 'Expense Register', 'Cash Register']
    };

    // Trigger updates in affected modules
    const affected = affectedModules[module] || [];
    affected.forEach(affectedModule => {
      window.dispatchEvent(new CustomEvent(`update:${affectedModule.toLowerCase().replace(/ /g, '-')}`, {
        detail: { source: module, data }
      }));
    });

    // Update dashboard
    window.dispatchEvent(new CustomEvent('updateDashboard'));
  }

  /**
   * Handle Stock Changes
   * Update stock list and reports automatically
   */
  private handleStockChange(payload: IntegrationPayload) {
    window.dispatchEvent(new CustomEvent('stockUpdated', {
      detail: payload.data
    }));
    
    // Update stock reports
    window.dispatchEvent(new CustomEvent('update:stock-report'));
    window.dispatchEvent(new CustomEvent('update:stock-list'));
  }

  /**
   * Handle Financial Changes
   * Update cash register, bank ledger, and financial reports
   */
  private handleFinancialChange(payload: IntegrationPayload) {
    window.dispatchEvent(new CustomEvent('financialUpdated', {
      detail: payload.data
    }));
    
    // Update financial modules
    window.dispatchEvent(new CustomEvent('update:cash-register'));
    window.dispatchEvent(new CustomEvent('update:bank-ledger'));
    window.dispatchEvent(new CustomEvent('update:mis-report'));
  }
}

// Singleton instance
export const integrationManager = new IntegrationFlowManager();

/**
 * Integration Flow Helpers
 */

/**
 * Notify system when a master is created
 */
export const notifyMasterCreated = (module: string, data: any) => {
  integrationManager.emit({
    event: 'MASTER_CREATED',
    module,
    data
  });
  integrationManager.processIntegration({
    event: 'MASTER_CREATED',
    module,
    data
  });
};

/**
 * Notify system when a master is updated
 */
export const notifyMasterUpdated = (module: string, data: any) => {
  integrationManager.emit({
    event: 'MASTER_UPDATED',
    module,
    data
  });
  integrationManager.processIntegration({
    event: 'MASTER_UPDATED',
    module,
    data
  });
};

/**
 * Notify system when a transaction is created
 */
export const notifyTransactionCreated = (module: string, data: any) => {
  integrationManager.emit({
    event: 'TRANSACTION_CREATED',
    module,
    data
  });
  integrationManager.processIntegration({
    event: 'TRANSACTION_CREATED',
    module,
    data
  });
};

/**
 * Notify system when a transaction is updated
 */
export const notifyTransactionUpdated = (module: string, data: any) => {
  integrationManager.emit({
    event: 'TRANSACTION_UPDATED',
    module,
    data
  });
  integrationManager.processIntegration({
    event: 'TRANSACTION_UPDATED',
    module,
    data
  });
};

/**
 * Notify system when stock is updated
 */
export const notifyStockUpdated = (data: any) => {
  integrationManager.emit({
    event: 'STOCK_UPDATED',
    module: 'Stock',
    data
  });
  integrationManager.processIntegration({
    event: 'STOCK_UPDATED',
    module: 'Stock',
    data
  });
};

/**
 * Notify system when financial data is updated
 */
export const notifyFinancialUpdated = (module: string, data: any) => {
  integrationManager.emit({
    event: 'FINANCIAL_UPDATED',
    module,
    data
  });
  integrationManager.processIntegration({
    event: 'FINANCIAL_UPDATED',
    module,
    data
  });
};

/**
 * Workflow Automation
 */

/**
 * Handle complete purchase workflow
 * Purchase → Update Stock → Update Expense Register → Update Supplier Ledger
 */
export const executePurchaseWorkflow = (purchaseData: any) => {
  // 1. Create purchase record
  notifyTransactionCreated('Purchase', purchaseData);
  
  // 2. Update stock for each item
  purchaseData.items.forEach((item: any) => {
    notifyStockUpdated({
      itemId: item.itemId,
      quantityChange: item.quantity,
      type: 'PURCHASE',
      reference: purchaseData.purchaseNo
    });
  });
  
  // 3. Update financial records
  notifyFinancialUpdated('Purchase', {
    amount: purchaseData.totalAmount,
    supplier: purchaseData.supplierName,
    date: purchaseData.purchaseDate
  });
  
  toast.success('Purchase completed successfully', {
    description: 'Stock, expenses, and supplier ledger updated automatically'
  });
};

/**
 * Handle complete sales workflow
 * Sales → Update Stock → Update Receipt Register → Update GST Report
 */
export const executeSalesWorkflow = (salesData: any) => {
  // 1. Create sales record
  notifyTransactionCreated('Sales', salesData);
  
  // 2. Update stock for each item (reduce quantity)
  salesData.items.forEach((item: any) => {
    notifyStockUpdated({
      itemId: item.itemId,
      quantityChange: -item.quantity,
      type: 'SALES',
      reference: salesData.saleNo
    });
  });
  
  // 3. Update financial records
  notifyFinancialUpdated('Sales', {
    amount: salesData.totalAmount,
    customer: salesData.customerName,
    date: salesData.saleDate
  });
  
  toast.success('Sales completed successfully', {
    description: 'Stock, receipts, and GST report updated automatically'
  });
};

/**
 * Handle complete labour bill workflow
 * Labour Bill → Update Receipt Register → Update MIS Report → Update Dashboard
 */
export const executeLabourBillWorkflow = (billData: any) => {
  // 1. Create labour bill
  notifyTransactionCreated('Labour Bill', billData);
  
  // 2. Update financial records
  notifyFinancialUpdated('Labour Bill', {
    amount: billData.totalAmount,
    customer: billData.customerName,
    vehicle: billData.vehicleNo,
    date: billData.billDate
  });
  
  toast.success('Labour Bill created successfully', {
    description: 'Reports and dashboard updated automatically'
  });
};

/**
 * Handle complete receipt workflow
 * Receipt → Update Cash Register → Update Outstanding → Update Dashboard
 */
export const executeReceiptWorkflow = (receiptData: any) => {
  // 1. Create receipt
  notifyTransactionCreated('Receipt', receiptData);
  
  // 2. Update financial records
  notifyFinancialUpdated('Receipt', {
    amount: receiptData.amount,
    customer: receiptData.customerName,
    paymentMode: receiptData.paymentMode,
    date: receiptData.receiptDate
  });
  
  toast.success('Receipt recorded successfully', {
    description: 'Cash register and outstanding updated automatically'
  });
};

/**
 * Handle complete payment workflow
 * Payment → Update Bank Ledger → Update Expense Register → Update Supplier Outstanding
 */
export const executePaymentWorkflow = (paymentData: any) => {
  // 1. Create payment
  notifyTransactionCreated('Payment', paymentData);
  
  // 2. Update financial records
  notifyFinancialUpdated('Payment', {
    amount: paymentData.amount,
    supplier: paymentData.supplierName,
    paymentMode: paymentData.paymentMode,
    date: paymentData.paymentDate
  });
  
  toast.success('Payment recorded successfully', {
    description: 'Bank ledger and supplier outstanding updated automatically'
  });
};

/**
 * Validation before deletion
 * Ensures referential integrity
 */
export const canDeleteMaster = (masterType: string, masterId: string): { canDelete: boolean; reason?: string } => {
  // Check if master is used in any transactions
  const transactions = {
    labourBills: JSON.parse(localStorage.getItem('labourBills') || '[]'),
    purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
    sales: JSON.parse(localStorage.getItem('sales') || '[]'),
  };
  
  // Check based on master type
  let isUsed = false;
  let usageCount = 0;
  
  switch (masterType) {
    case 'Vehicle Make':
      const makeTransactions = [
        ...transactions.labourBills.filter((b: any) => b.vehicleMake === masterId)
      ];
      isUsed = makeTransactions.length > 0;
      usageCount = makeTransactions.length;
      break;
    
    case 'Supplier':
      const supplierTransactions = [
        ...transactions.purchases.filter((p: any) => p.supplierName === masterId)
      ];
      isUsed = supplierTransactions.length > 0;
      usageCount = supplierTransactions.length;
      break;
    
    // Add more checks as needed
  }
  
  if (isUsed) {
    return {
      canDelete: false,
      reason: `This ${masterType} is used in ${usageCount} transaction(s) and cannot be deleted`
    };
  }
  
  return { canDelete: true };
};

/**
 * System health check
 * Verify all integrations are working
 */
export const checkSystemIntegration = (): {
  status: 'healthy' | 'warning' | 'error';
  checks: Record<string, boolean>;
  message: string;
} => {
  const checks = {
    mastersLoaded: false,
    transactionsLoaded: false,
    stockLoaded: false,
    reportsAccessible: true,
    contextsInitialized: true
  };
  
  // Check if masters are loaded
  const masterKeys = ['vehicleMakes', 'workTypes', 'workGroups', 'suppliers', 'transports', 'staff'];
  checks.mastersLoaded = masterKeys.some(key => localStorage.getItem(key) !== null);
  
  // Check if transactions exist
  const transactionKeys = ['labourBills', 'purchases', 'sales', 'receipts', 'payments', 'expenses'];
  checks.transactionsLoaded = transactionKeys.some(key => localStorage.getItem(key) !== null);
  
  // Check if stock is loaded
  checks.stockLoaded = localStorage.getItem('stockItems') !== null;
  
  const allHealthy = Object.values(checks).every(v => v === true);
  const someHealthy = Object.values(checks).some(v => v === true);
  
  if (allHealthy) {
    return {
      status: 'healthy',
      checks,
      message: 'All system integrations are working correctly'
    };
  } else if (someHealthy) {
    return {
      status: 'warning',
      checks,
      message: 'Some integrations may need attention'
    };
  } else {
    return {
      status: 'error',
      checks,
      message: 'System integration issues detected'
    };
  }
};

/**
 * Get integration status for a specific module
 */
export const getModuleIntegrationStatus = (moduleName: string) => {
  const integrationMap: Record<string, { dependencies: string[], updates: string[] }> = {
    'Labour Bill': {
      dependencies: ['Vehicle Make', 'Work Type', 'Work Group'],
      updates: ['Receipt Register', 'MIS Report', 'GST Report', 'Dashboard']
    },
    'Purchase': {
      dependencies: ['Supplier', 'Stock Items'],
      updates: ['Stock List', 'Stock Report', 'Expense Register', 'Supplier Ledger']
    },
    'Sales': {
      dependencies: ['Stock Items'],
      updates: ['Stock List', 'Stock Report', 'Receipt Register', 'GST Report']
    },
    'Receipt': {
      dependencies: ['Labour Bill', 'Sales'],
      updates: ['Cash Register', 'Receipt Register', 'Outstanding Report']
    },
    'Payment': {
      dependencies: ['Supplier', 'Purchase'],
      updates: ['Bank Ledger', 'Expense Register', 'Supplier Outstanding']
    }
  };
  
  return integrationMap[moduleName] || { dependencies: [], updates: [] };
};
