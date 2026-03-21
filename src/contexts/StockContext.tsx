import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';

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

  const { isAuthenticated } = useAuth();

  const fetchStock = useCallback(async () => {
    if (!isAuthenticated) {
      setStockRows([]);
      return;
    }
    const response = await api.get(endpoints.inventory.stock.list);
    const rows = (response.data as any)?.data || [];
    setStockRows(rows);
  }, [isAuthenticated]);

  const fetchAdjustments = useCallback(async () => {
    if (!isAuthenticated) {
      setAdjustmentRows([]);
      return;
    }
    const response = await api.get('/inventory/adjustments');
    const rows = (response.data as any)?.data || [];
    setAdjustmentRows(rows);
  }, [isAuthenticated]);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await Promise.all([fetchStock(), fetchAdjustments()]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdjustments, fetchStock, isAuthenticated]);

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
        id: String(row.id),
        itemCode: row.item_code || row.part_number || `ITM-${String(row.id).padStart(3, '0')}`,
        itemName: row.item_name || '',
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
    await api.post('/inventory/stock', {
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      brand: item.brand,
      unit: item.unit,
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      reorderLevel: item.reorderLevel,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
      location: item.location,
      status: 'Active',
    });
    await refreshAll();
  };

  const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
    await api.put(`/inventory/stock/${id}`, {
      itemCode: updates.itemCode,
      itemName: updates.itemName,
      category: updates.category,
      brand: updates.brand,
      unit: updates.unit,
      currentStock: updates.currentStock,
      minStock: updates.minStock,
      maxStock: updates.maxStock,
      reorderLevel: updates.reorderLevel,
      unitPrice: updates.unitPrice,
      supplier: updates.supplier,
      location: updates.location,
      lastPurchaseDate: updates.lastPurchaseDate,
      lastSaleDate: updates.lastSaleDate,
    });
    await refreshAll();
  };

  const deleteStockItem = async (id: string) => {
    await api.delete(`/inventory/stock/${id}`);
    await refreshAll();
  };

  const addAdjustment = async (adjustment: Omit<StockAdjustment, 'id'>) => {
    const linkedItem = stockLookup.get(adjustment.itemId);
    await api.post('/inventory/adjustments', {
      adjustment_no: adjustment.adjustmentNo,
      adjustment_date: adjustment.date,
      stock_item_id: adjustment.itemId,
      item_name: adjustment.itemName || linkedItem?.itemName,
      item_code: adjustment.itemCode || linkedItem?.itemCode,
      adjustment_type: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      notes: adjustment.remarks,
    });
    await refreshAll();
  };

  const updateAdjustment = async (id: string, adjustment: Omit<StockAdjustment, 'id'>) => {
    const linkedItem = stockLookup.get(adjustment.itemId);
    await api.put(`/inventory/adjustments/${id}`, {
      adjustment_no: adjustment.adjustmentNo,
      adjustment_date: adjustment.date,
      stock_item_id: adjustment.itemId,
      item_name: adjustment.itemName || linkedItem?.itemName,
      item_code: adjustment.itemCode || linkedItem?.itemCode,
      adjustment_type: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      notes: adjustment.remarks,
    });
    await refreshAll();
  };

  const deleteAdjustment = async (id: string) => {
    await api.delete(`/inventory/adjustments/${id}`);
    await refreshAll();
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
