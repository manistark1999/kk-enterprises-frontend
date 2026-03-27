import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useDashboardRefresh } from './DashboardRefreshContext';

export interface StockItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  brand: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  location: string;
  lastPurchaseDate: string;
  lastSaleDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
}

export interface StockAdjustment {
  id: string;
  adjustmentNo: string;
  date: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  adjustmentType: 'Add' | 'Remove';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  remarks: string;
  createdAt: string;
}

interface StockContextType {
  stockItems: StockItem[];
  adjustments: StockAdjustment[];
  isLoading: boolean;
  addStockItem: (item: Partial<StockItem>) => Promise<void>;
  updateStockItem: (id: string, updates: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  addAdjustment: (adjustment: Omit<StockAdjustment, 'id'>) => Promise<void>;
  updateAdjustment: (id: string, adjustment: Omit<StockAdjustment, 'id'>) => Promise<void>;
  deleteAdjustment: (id: string) => Promise<void>;
  adjustStock: (
    itemId: string,
    type: 'Add' | 'Remove',
    quantity: number,
    reason: string,
    remarks: string,
    date?: string
  ) => Promise<void>;
  refreshStock: () => Promise<void>;
  refreshAdjustments: () => Promise<void>;
  fetchNextStockCode: () => Promise<string | null>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const deriveStatus = (currentStock: number, minStock: number, maxStock: number): StockItem['status'] => {
  if (currentStock <= 0) return 'Out of Stock';
  if (currentStock < minStock) return 'Low Stock';
  if (maxStock > 0 && currentStock > maxStock) return 'Overstocked';
  return 'In Stock';
};

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toISOString().split('T')[0] : '';

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stockRows, setStockRows] = useState<any[]>([]);
  const [adjustmentRows, setAdjustmentRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, hasPermission } = useAuth();
  const { triggerDashboardRefresh } = useDashboardRefresh();

  const fetchStock = useCallback(async () => {
    if (!isAuthenticated || !hasPermission('Stock List', 'view')) {
      if (!isAuthenticated) setStockRows([]);
      return;
    }
    try {
      const response = await api.get(endpoints.inventory.stock.list);
      const rows = response.data || [];
      setStockRows(Array.isArray(rows) ? rows : []);
    } catch (error) {
      // Background fetch error - silented
    }
  }, [isAuthenticated, hasPermission]);

  const fetchAdjustments = useCallback(async () => {
    if (!isAuthenticated || !hasPermission('Stock Adjustment', 'view')) {
      if (!isAuthenticated) setAdjustmentRows([]);
      return;
    }
    try {
      const response = await api.get('/inventory/adjustments');
      const rows = response.data || [];
      setAdjustmentRows(Array.isArray(rows) ? rows : []);
    } catch (error) {
      // Background fetch error - silented
    }
  }, [isAuthenticated, hasPermission]);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const tasks = [];
      if (hasPermission('Stock List', 'view')) tasks.push(fetchStock());
      if (hasPermission('Stock Adjustment', 'view')) tasks.push(fetchAdjustments());
      await Promise.all(tasks);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdjustments, fetchStock, isAuthenticated, hasPermission]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll, isAuthenticated]);

  const stockItems = useMemo<StockItem[]>(() => {
    return stockRows.map((row) => {
      const currentStock = toNumber(row.current_stock, 0);
      const minStock = toNumber(row.min_stock, 0);
      const maxStock = toNumber(row.max_stock, 0);
      const unitPrice = toNumber(row.selling_price ?? row.purchase_price, 0);

      return {
        id: String(row.id || row.itemId || row.item_id || ''),
        itemCode: row.item_code || row.itemCode || row.part_number || `ITM-${String(row.id).padStart(3, '0')}`,
        itemName: row.item_name || row.itemName || row.name || '',
        category: row.category || '',
        brand: row.brand || '',
        unit: row.unit || 'Nos',
        currentStock,
        minStock,
        maxStock,
        reorderLevel: toNumber(row.reorder_level, minStock),
        unitPrice,
        totalValue: currentStock * unitPrice,
        supplier: row.supplier_name || '',
        location: row.location || '',
        lastPurchaseDate: formatDate(row.last_purchase_date),
        lastSaleDate: formatDate(row.last_sale_date),
        status: deriveStatus(currentStock, minStock, maxStock),
      };
    });
  }, [stockRows]);

  const stockLookup = useMemo(() => {
    const lookup = new Map<string, StockItem>();
    stockItems.forEach((item) => {
      lookup.set(item.id, item);
    });
    return lookup;
  }, [stockItems]);

  const adjustments = useMemo<StockAdjustment[]>(() => {
    return adjustmentRows.map((row) => {
      const linkedStockItem = stockLookup.get(String(row.stock_item_id || ''));
      return {
        id: String(row.id),
        adjustmentNo: row.adjustment_no || `ADJ-${String(row.id).padStart(5, '0')}`,
        date: formatDate(row.adjustment_date),
        itemId: String(row.stock_item_id || linkedStockItem?.id || row.item_id || ''),
        itemCode: row.item_code || linkedStockItem?.itemCode || '',
        itemName: row.item_name || linkedStockItem?.itemName || '',
        adjustmentType: (row.adjustment_type || 'Add') as 'Add' | 'Remove',
        quantity: toNumber(row.quantity, 0),
        previousStock: toNumber(row.previous_stock, 0),
        newStock: toNumber(row.new_stock, 0),
        reason: row.reason || '',
        remarks: row.notes || '',
        createdAt: row.created_at || '',
      };
    });
  }, [adjustmentRows, stockLookup]);

  const addStockItem = async (item: Partial<StockItem>) => {
    try {
      const payload = {
        item_code: item.itemCode,
        item_name: item.itemName,
        category: item.category,
        brand: item.brand,
        unit: item.unit || 'Nos',
        current_stock: item.currentStock || 0,
        min_stock: item.minStock || 0,
        max_stock: item.maxStock || 0,
        reorder_level: item.reorderLevel || 0,
        selling_price: item.unitPrice || 0,
        purchase_price: item.unitPrice || 0, // Fallback if not specified
        supplier_name: item.supplier,
        location: item.location,
        status: 'Active',
      };

      console.log('[INV-CTX] Sending creation payload to backend:', JSON.stringify(payload, null, 2));
      const response = await api.post('/inventory/stock', payload);
      console.log('[INV-CTX] Backend response received:', response);
      if (response.success) {
        await refreshAll();
        triggerDashboardRefresh();
        toast.success(response.message || 'Stock item added successfully');
      } else {
        const errorMsg = response.message || 'Failed to add stock item';
        console.error('[INV-CTX] Save action returned success false:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('[INV-CTX] EXCEPTION during save:', error);
      toast.error(error.message || 'Error occurred while saving stock item');
      throw error;
    }
  };

  const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
    try {
      const existing = stockItems.find(s => s.id === id);
      const merged = { ...existing, ...updates } as StockItem;

      const payload = {
        item_code: merged.itemCode,
        item_name: merged.itemName,
        category: merged.category,
        brand: merged.brand,
        unit: merged.unit,
        current_stock: merged.currentStock,
        min_stock: merged.minStock,
        max_stock: merged.maxStock,
        reorder_level: merged.reorderLevel,
        selling_price: merged.unitPrice,
        purchase_price: merged.unitPrice, // Update logic might need separate field
        supplier_name: merged.supplier,
        location: merged.location,
        last_purchase_date: merged.lastPurchaseDate,
        last_sale_date: merged.lastSaleDate,
      };

      const response = await api.put(`/inventory/stock/${id}`, payload);
      if (response.success) {
        await refreshAll();
        triggerDashboardRefresh();
        toast.success('Stock item updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update stock item');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stock item');
      throw error;
    }
  };

  const deleteStockItem = async (id: string) => {
    await api.delete(`/inventory/stock/${id}`);
    await refreshAll();
    triggerDashboardRefresh();
  };

  const addAdjustment = async (adjustment: Omit<StockAdjustment, 'id'>) => {
    const linkedItem = stockLookup.get(adjustment.itemId);
    const payload = {
      adjustment_no: adjustment.adjustmentNo,
      adjustment_date: adjustment.date,
      stock_item_id: adjustment.itemId,
      item_name: adjustment.itemName || linkedItem?.itemName,
      item_code: adjustment.itemCode || linkedItem?.itemCode,
      adjustment_type: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      notes: adjustment.remarks,
    };

    try {
      const response = await api.post('/inventory/adjustments', payload);

      if (response.success) {
        await refreshAll();
        triggerDashboardRefresh();
        toast.success('Stock adjustment created successfully.');
      } else {
        throw new Error(response.message || response.error || 'Failed to create adjustment');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while creating the adjustment.');
      throw error;
    }
  };

  const updateAdjustment = async (id: string, adjustment: Omit<StockAdjustment, 'id'>) => {
    const linkedItem = stockLookup.get(adjustment.itemId);
    const payload = {
      adjustment_no: adjustment.adjustmentNo,
      adjustment_date: adjustment.date,
      stock_item_id: adjustment.itemId,
      item_name: adjustment.itemName || linkedItem?.itemName,
      item_code: adjustment.itemCode || linkedItem?.itemCode,
      adjustment_type: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      notes: adjustment.remarks,
    };

    try {
      const response = await api.put(`/inventory/adjustments/${id}`, payload);
      
      if (response.success) {
        await refreshAll();
        toast.success('Stock adjustment updated successfully.');
      } else {
        throw new Error(response.message || response.error || 'Failed to update adjustment');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating the adjustment.');
      throw error;
    }
  };

  const deleteAdjustment = async (id: string) => {
    try {
      const response = await api.delete(`/inventory/adjustments/${id}`);
      
      if (response.success) {
        await refreshAll();
        toast.success('Stock adjustment deleted successfully.');
      } else {
        throw new Error(response.message || response.error || 'Failed to delete adjustment');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while deleting the adjustment.');
      throw error;
    }
  };

  const fetchNextStockCode = async (): Promise<string | null> => {
    try {
      const response = await api.get('/inventory/stock/next-number');
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const adjustStock = async (
    itemId: string,
    type: 'Add' | 'Remove',
    quantity: number,
    reason: string,
    remarks: string,
    date?: string
  ) => {
    const selectedItem = stockLookup.get(itemId);
    if (!selectedItem) {
      throw new Error('Selected item not found');
    }

    await addAdjustment({
      adjustmentNo: '',
      date: date || new Date().toISOString().split('T')[0],
      itemId,
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemName,
      adjustmentType: type,
      quantity,
      previousStock: selectedItem.currentStock,
      newStock:
        type === 'Add'
          ? selectedItem.currentStock + quantity
          : selectedItem.currentStock - quantity,
      reason,
      remarks,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <StockContext.Provider
      value={{
        stockItems,
        adjustments,
        isLoading,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        addAdjustment,
        updateAdjustment,
        deleteAdjustment,
        adjustStock,
        refreshStock: fetchStock,
        refreshAdjustments: fetchAdjustments,
        fetchNextStockCode,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
