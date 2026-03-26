import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface ItemService {
  id: string;
  name: string;
  type: 'Item' | 'Service';
  category?: string;
  workGroupId?: string;
  workGroup?: string;
  defaultRate: number;
  gstPercentage: number;
  unit: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  
  // Additional fields for Items
  hsnCode?: string;
  currentStock?: number;
  minStockLevel?: number;
  brand?: string;
  partNumber?: string;
  purchasePrice?: number;
}

interface ItemsServicesContextType {
  itemsServices: ItemService[];
  addItemService: (item: Partial<ItemService>) => Promise<void>;
  updateItemService: (id: string, item: Partial<ItemService>) => Promise<void>;
  deleteItemService: (id: string) => Promise<void>;
  getActiveItemsServices: () => ItemService[];
  getActiveItems: () => ItemService[];
  getActiveServices: () => ItemService[];
  getItemServiceById: (id: string) => ItemService | undefined;
  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract') => Promise<void>;
  refreshItems: () => Promise<void>;
  fetchNextItemCode: () => Promise<string | null>;
  isLoading: boolean;
}

const ItemsServicesContext = createContext<ItemsServicesContextType | undefined>(undefined);

export function ItemsServicesProvider({ children }: { children: ReactNode }) {
  const [itemsServices, setItemsServices] = useState<ItemService[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mapRow = (r: any): ItemService => ({
    id: r.id.toString(),
    name: r.name,
    type: r.type || 'Item',
    category: r.category || '',
    brand: r.brand || '',
    partNumber: r.part_number || '',
    unit: r.unit || 'Piece',
    hsnCode: r.hsn_code || '',
    defaultRate: r.selling_price ? parseFloat(r.selling_price) : 0,
    purchasePrice: r.purchase_price ? parseFloat(r.purchase_price) : 0,
    gstPercentage: r.gst_rate ? parseFloat(r.gst_rate) : 18,
    currentStock: r.stock ? parseFloat(r.stock) : 0,
    minStockLevel: r.min_stock ? parseFloat(r.min_stock) : 0,
    status: (r.status || 'Active') as 'Active' | 'Inactive',
    createdAt: r.created_at,
    description: r.description || ''
  });

  const { isAuthenticated } = useAuth();

  const fetchItems = async () => {
    if (!isAuthenticated) {
      setItemsServices([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/items');
      if (res.success && res.data) {
        const rows = res.data.data || res.data;
        setItemsServices(rows.map(mapRow));
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [isAuthenticated]);

  const addItemService = async (item: Partial<ItemService>) => {
    try {
      const payload = {
        name: item.name,
        type: item.type || 'Item',
        category: item.category,
        brand: item.brand,
        part_number: item.partNumber,
        unit: item.unit || 'Nos',
        hsn_code: item.hsnCode,
        selling_price: item.defaultRate,
        purchase_price: item.purchasePrice,
        gst_rate: item.gstPercentage,
        stock: item.currentStock || 0,
        min_stock: item.minStockLevel || 0,
        status: item.status || 'Active',
        description: item.description
      };

      const response = await api.post('/items', payload);
      if (response.success) {
        await fetchItems();
        toast.success('Item/Service added successfully');
      } else {
        throw new Error(response.message || 'Failed to add item/service');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item/service');
      throw error;
    }
  };

  const updateItemService = async (id: string, item: Partial<ItemService>) => {
    try {
      const existing = itemsServices.find(i => i.id === id);
      const merged = { ...existing, ...item };
      
      const payload = {
        name: merged.name,
        type: merged.type,
        category: merged.category,
        brand: merged.brand,
        part_number: merged.partNumber,
        unit: merged.unit || 'Nos',
        hsn_code: merged.hsnCode,
        selling_price: merged.defaultRate,
        purchase_price: merged.purchasePrice,
        gst_rate: merged.gstPercentage,
        stock: merged.currentStock,
        min_stock: merged.minStockLevel,
        status: merged.status,
        description: merged.description
      };

      const response = await api.put(`/items/${id}`, payload);
      if (response.success) {
        await fetchItems();
        toast.success('Item/Service updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update item/service');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update item/service');
      throw error;
    }
  };

  const deleteItemService = async (id: string) => {
    try {
        const response = await api.delete(`/items/${id}`);
        if (response.success) {
            await fetchItems();
            toast.success('Item/Service deleted successfully.');
        } else {
            throw new Error(response.message || response.error || 'Failed to delete item/service');
        }
    } catch (error: any) {
        toast.error(error.message || 'An error occurred while deleting the item/service.');
        throw error;
    }
  };

  const updateStock = async (id: string, quantity: number, operation: 'add' | 'subtract') => {
    const item = itemsServices.find(i => i.id === id);
    if (!item) return;

    const currentStock = item.currentStock || 0;
    const newStock = operation === 'add' ? currentStock + quantity : currentStock - quantity;
    
    await updateItemService(id, { ...item, currentStock: Math.max(0, newStock) });
  };

  const getActiveItemsServices = () => itemsServices.filter(item => item.status === 'Active');
  const getActiveItems = () => itemsServices.filter(item => item.type === 'Item' && item.status === 'Active');
  const getActiveServices = () => itemsServices.filter(item => item.type === 'Service' && item.status === 'Active');
  const fetchNextItemCode = async (): Promise<string | null> => {
    try {
      const res = await api.get('/items/next-code');
      if (res.success && res.data) {
        return res.data.data || res.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const getItemServiceById = (id: string) => itemsServices.find(item => item.id === id);

  return (
    <ItemsServicesContext.Provider
      value={{
        itemsServices,
        addItemService,
        updateItemService,
        deleteItemService,
        getActiveItemsServices,
        getActiveItems,
        getActiveServices,
        getItemServiceById,
        updateStock,
        refreshItems: fetchItems,
        fetchNextItemCode,
        isLoading
      }}
    >
      {children}
    </ItemsServicesContext.Provider>
  );
}

export function useItemsServices() {
  const context = useContext(ItemsServicesContext);
  if (!context) {
    throw new Error('useItemsServices must be used within ItemsServicesProvider');
  }
  return context;
}