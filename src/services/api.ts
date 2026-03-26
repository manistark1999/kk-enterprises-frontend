// API Configuration
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – Vite injects import.meta.env at build time
const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5001/api';


// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// In-flight request tracker (prevents double-submits on rapid clicks)
const inFlightRequests = new Map<string, Promise<any>>();

// Generic API Request Handler
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const method = options.method || 'GET';
  
  // For mutating requests, use a dedup key to prevent double-click issues
  const dedupKey = `${method}:${endpoint}:${options.body || ''}`;
  if ((method === 'POST' || method === 'PUT') && inFlightRequests.has(dedupKey)) {
    return inFlightRequests.get(dedupKey)!;
  }

  const requestPromise = (async () => {
    try {
      const token = localStorage.getItem('kk_auth_token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // GET ALL RAW CONTENT FIRST FOR LOGGING & TO PREVENT .json() CRASHES
      const rawResponseText = await response.text();
      
      let data: any = {};
      if (rawResponseText) {
        try {
          data = JSON.parse(rawResponseText);
        } catch (e) {
          throw new Error(`Invalid JSON response from server: ${rawResponseText.substring(0, 100)}...`);
        }
      }

      if (!response.ok) {
        // CRITICAL FIX: Throw so callers properly catch this as an error
        const errorMsg = data.message || data.error || `Server error ${response.status}`;
        throw new Error(errorMsg);
      }

      return {
        success: data.success ?? response.ok,
        data: data,
        message: data.message || (response.ok ? 'Success' : 'Error'),
      } as ApiResponse<T>;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error occurred';
      // Re-throw so calling code (context functions) can catch and show proper error toast
      throw error;
    } finally {
      inFlightRequests.delete(dedupKey);
    }
  })();

  if (method === 'POST' || method === 'PUT') {
    inFlightRequests.set(dedupKey, requestPromise);
  }

  return requestPromise;
}


// API Methods
export const api = {
  // GET request
  get: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  // POST request
  post: <T = any>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT request
  put: <T = any>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // PATCH request
  patch: <T = any>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// Specific API Endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    verify: '/auth/verify',
  },

  // Billing
  billing: {
    labourBill: {
      create: '/labour-bills',
      list: '/labour-bills',
      getById: (id: string) => `/labour-bills/${id}`,
      update: (id: string) => `/labour-bills/${id}`,
      delete: (id: string) => `/labour-bills/${id}`,
      nextNumber: '/labour-bills/next-number',
    },
    estimation: {
      create: '/estimations',
      list: '/estimations',
      getById: (id: string) => `/estimations/${id}`,
      update: (id: string) => `/estimations/${id}`,
      delete: (id: string) => `/estimations/${id}`,
      nextNumber: '/estimations/next-number',
    },
    receipt: {
      create: '/receipts',
      list: '/receipts',
      getById: (id: string) => `/receipts/${id}`,
      update: (id: string) => `/receipts/${id}`,
      delete: (id: string) => `/receipts/${id}`,
    },
    jobcard: {
      create: '/jobcards',
      list: '/jobcards',
      getById: (id: string) => `/jobcards/${id}`,
      update: (id: string) => `/jobcards/${id}`,
      delete: (id: string) => `/jobcards/${id}`,
      nextNumber: '/jobcards/next-number',
    },
    payment: {
      create: '/payments', // Note: Placeholder if separate payment route exists or if merged
      list: '/payments',
    },
  },

  // Inventory
  inventory: {
    sales: {
      create: '/inventory/sales',
      list: '/inventory/sales',
      getById: (id: string) => `/inventory/sales/${id}`,
      update: (id: string) => `/inventory/sales/${id}`,
      delete: (id: string) => `/inventory/sales/${id}`,
      nextNumber: '/inventory/sales/next-number',
    },
    purchase: {
      create: '/inventory/purchases',
      list: '/inventory/purchases',
      getById: (id: string) => `/inventory/purchases/${id}`,
      update: (id: string) => `/inventory/purchases/${id}`,
      delete: (id: string) => `/inventory/purchases/${id}`,
      nextNumber: '/inventory/purchases/next-number',
    },
    stock: {
      list: '/inventory/stock',
      adjustment: '/inventory/stock/adjustment',
      getById: (id: string) => `/inventory/stock/${id}`,
    },
  },

  // Accounts
  accounts: {
    expense: {
      create: '/expenses',
      list: '/expenses',
      getById: (id: string) => `/expenses/${id}`,
      update: (id: string) => `/expenses/${id}`,
      delete: (id: string) => `/expenses/${id}`,
    },
    advance: {
      create: '/staff-advances',
      list: '/staff-advances',
      getById: (id: string) => `/staff-advances/${id}`,
      update: (id: string) => `/staff-advances/${id}`,
      delete: (id: string) => `/staff-advances/${id}`,
    },
    salary: {
      create: '/salary-entries',
      list: '/salary-entries',
      getById: (id: string) => `/salary-entries/${id}`,
      update: (id: string) => `/salary-entries/${id}`,
      delete: (id: string) => `/salary-entries/${id}`,
    },
    bankAccounts: {
      create: '/bank-accounts',
      list: '/bank-accounts',
      getById: (id: string) => `/bank-accounts/${id}`,
      update: (id: string) => `/bank-accounts/${id}`,
      delete: (id: string) => `/bank-accounts/${id}`,
    },
  },

  // Reports
  reports: {
    mis: '/reports/mis',
    stock: '/reports/stock',
    outstanding: '/reports/outstanding',
    gst: '/reports/gst',
    cashRegister: '/reports/cash-register',
    expenseRegister: '/reports/expense-register',
    receiptRegister: '/reports/receipt-register',
    alignmentRegister: '/reports/alignment-register',
  },

  // Masters
  masters: {
    customer: {
      create: '/customers',
      list: '/customers',
      getById: (id: string) => `/customers/${id}`,
      update: (id: string) => `/customers/${id}`,
      delete: (id: string) => `/customers/${id}`,
    },
    vehicleMake: {
      create: '/vehicle-makes',
      list: '/vehicle-makes',
      getById: (id: string) => `/vehicle-makes/${id}`,
      update: (id: string) => `/vehicle-makes/${id}`,
      delete: (id: string) => `/vehicle-makes/${id}`,
    },
    vehicleRegistry: {
      create: '/vehicle-registry',
      list: '/vehicle-registry',
      getById: (id: string) => `/vehicle-registry/${id}`,
      update: (id: string) => `/vehicle-registry/${id}`,
      delete: (id: string) => `/vehicle-registry/${id}`,
      lookup: (vNo: string) => `/vehicle-registry/lookup/${encodeURIComponent(vNo)}`,
    },
    work: {
      create: '/work',
      list: '/work',
      getById: (id: string) => `/work/${id}`,
      update: (id: string) => `/work/${id}`,
      delete: (id: string) => `/work/${id}`,
    },
    supplier: {
      create: '/suppliers',
      list: '/suppliers',
      getById: (id: string) => `/suppliers/${id}`,
      update: (id: string) => `/suppliers/${id}`,
      delete: (id: string) => `/suppliers/${id}`,
    },
    brand: {
      create: '/brands',
      list: '/brands',
      getById: (id: string) => `/brands/${id}`,
      update: (id: string) => `/brands/${id}`,
      delete: (id: string) => `/brands/${id}`,
    },
    transport: {
      create: '/transports',
      list: '/transports',
      getById: (id: string) => `/transports/${id}`,
      update: (id: string) => `/transports/${id}`,
      delete: (id: string) => `/transports/${id}`,
    },
    staff: {
      create: '/staff',
      list: '/staff',
      getById: (id: string) => `/staff/${id}`,
      update: (id: string) => `/staff/${id}`,
      delete: (id: string) => `/staff/${id}`,
    },
    item: {
      create: '/items',
      list: '/items',
      getById: (id: string) => `/items/${id}`,
      update: (id: string) => `/items/${id}`,
      delete: (id: string) => `/items/${id}`,
    },
  },

  // Settings
  settings: {
    users: '/auth/users', // Potential if added later
    company: '/company',
    financialYear: {
      create: '/financial-years',
      list: '/financial-years',
      getById: (id: string) => `/financial-years/${id}`,
      update: (id: string) => `/financial-years/${id}`,
      delete: (id: string) => `/financial-years/${id}`,
    },
  },

  // Dashboard
  dashboard: {
    overview: '/dashboard/overview',
    stats: '/dashboard/stats',
    recentActivity: '/dashboard/recent-activity',
    stockAlerts: '/dashboard/stock-alerts',
  },

  // Audit Logs
  audit: {
    logs: '/audit',
    create: '/audit',
    getById: (id: string) => `/audit/${id}`,
  }
};