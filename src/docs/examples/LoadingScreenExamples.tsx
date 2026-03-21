/**
 * Loading Screen Implementation Examples
 * 
 * This file provides practical examples of how to use the Lottie Loading System
 * across different screens and scenarios in the KK Enterprises application.
 */

import React, { useState, useEffect } from 'react';
import { LottieLoadingScreen } from '@/components/shared/LottieLoadingScreen';
import { useLoadingScreen } from '../hooks/useLoadingScreen';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';

// ============================================================================
// EXAMPLE 1: Basic Screen with Loading
// ============================================================================
export function Example1_BasicLoading({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, showLoading, hideLoading } = useLoadingScreen();

  const handleLoadData = async () => {
    showLoading('Loading data...');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data loaded successfully!');
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      {/* Loading Screen Overlay */}
      {isLoading && <LottieLoadingScreen isDarkMode={isDarkMode} />}
      
      {/* Your Screen Content */}
      <div className="p-6">
        <h1>Basic Loading Example</h1>
        <button onClick={handleLoadData}>Load Data</button>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 2: Loading with Custom Message
// ============================================================================
export function Example2_CustomMessage({ isDarkMode }: { isDarkMode: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('Saving job card...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Job card saved!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <LottieLoadingScreen 
          isDarkMode={isDarkMode} 
          message={message} 
        />
      )}
      
      <div className="p-6">
        <h1>Custom Message Example</h1>
        <button onClick={handleSave}>Save Job Card</button>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 3: Using withLoading Helper
// ============================================================================
export function Example3_WithLoadingHelper({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, withLoading } = useLoadingScreen();

  const fetchVehicles = async () => {
    return await withLoading(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        return ['Vehicle 1', 'Vehicle 2', 'Vehicle 3'];
      },
      'Fetching vehicles...'
    );
  };

  const handleFetch = async () => {
    const vehicles = await fetchVehicles();
    toast.success(`Loaded ${vehicles.length} vehicles`);
  };

  return (
    <>
      {isLoading && <LottieLoadingScreen isDarkMode={isDarkMode} />}
      
      <div className="p-6">
        <h1>With Loading Helper Example</h1>
        <button onClick={handleFetch}>Fetch Vehicles</button>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 4: Global Loading Context
// ============================================================================
export function Example4_GlobalContext({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, withLoading } = useLoading();

  const generateReport = async () => {
    await withLoading(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        toast.success('Report generated!');
      },
      'Generating report...'
    );
  };

  return (
    <>
      {/* Note: When using global context, the LottieLoadingScreen 
          should be placed at the app root level */}
      <div className="p-6">
        <h1>Global Context Example</h1>
        <button onClick={generateReport}>Generate Report</button>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 5: Load on Mount
// ============================================================================
export function Example5_LoadOnMount({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, withLoading } = useLoadingScreen();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const result = await withLoading(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return ['Item 1', 'Item 2', 'Item 3'];
        },
        'Loading initial data...'
      );
      setData(result);
    };

    loadInitialData();
  }, []);

  return (
    <>
      {isLoading && <LottieLoadingScreen isDarkMode={isDarkMode} />}
      
      <div className="p-6">
        <h1>Load on Mount Example</h1>
        <ul>
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 6: Multiple Operations
// ============================================================================
export function Example6_MultipleOperations({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, showLoading, hideLoading } = useLoadingScreen();

  const handleMultipleOperations = async () => {
    showLoading('Step 1: Validating data...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    showLoading('Step 2: Saving to database...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    showLoading('Step 3: Sending notifications...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    hideLoading();
    toast.success('All operations completed!');
  };

  return (
    <>
      {isLoading && <LottieLoadingScreen isDarkMode={isDarkMode} />}
      
      <div className="p-6">
        <h1>Multiple Operations Example</h1>
        <button onClick={handleMultipleOperations}>Run All Steps</button>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 7: Job Card Screen Integration
// ============================================================================
export function Example7_JobCardIntegration({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, withLoading } = useLoadingScreen();
  const [jobCard, setJobCard] = useState<any>(null);

  const saveJobCard = async (data: any) => {
    await withLoading(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Save to localStorage
        const jobCards = JSON.parse(localStorage.getItem('jobCards') || '[]');
        jobCards.push(data);
        localStorage.setItem('jobCards', JSON.stringify(jobCards));
        
        toast.success('Job card saved successfully!');
      },
      'Saving job card...'
    );
  };

  const loadJobCard = async (id: string) => {
    const result = await withLoading(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const jobCards = JSON.parse(localStorage.getItem('jobCards') || '[]');
        return jobCards.find((jc: any) => jc.id === id);
      },
      'Loading job card...'
    );
    setJobCard(result);
  };

  return (
    <>
      {isLoading && <LottieLoadingScreen isDarkMode={isDarkMode} />}
      
      <div className="p-6">
        <h1>Job Card Example</h1>
        <button onClick={() => saveJobCard({ id: '123', vehicle: 'MH-01-AB-1234' })}>
          Save Job Card
        </button>
        <button onClick={() => loadJobCard('123')}>
          Load Job Card
        </button>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 8: Vehicle Registry Integration
// ============================================================================
export function Example8_VehicleRegistryIntegration({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, withLoading } = useLoadingScreen();
  const [vehicles, setVehicles] = useState<any[]>([]);

  const loadVehicles = async () => {
    const data = await withLoading(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return JSON.parse(localStorage.getItem('vehicles') || '[]');
      },
      'Loading vehicles...'
    );
    setVehicles(data);
  };

  const addVehicle = async (vehicle: any) => {
    await withLoading(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const current = JSON.parse(localStorage.getItem('vehicles') || '[]');
        current.push(vehicle);
        localStorage.setItem('vehicles', JSON.stringify(current));
        toast.success('Vehicle added successfully!');
      },
      'Adding vehicle...'
    );
    loadVehicles();
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <>
      {isLoading && <LottieLoadingScreen isDarkMode={isDarkMode} />}
      
      <div className="p-6">
        <h1>Vehicle Registry Example</h1>
        <button onClick={() => addVehicle({ registrationNo: 'MH-01-AB-1234' })}>
          Add Vehicle
        </button>
        <div>Total Vehicles: {vehicles.length}</div>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 9: Billing Screen Integration
// ============================================================================
export function Example9_BillingIntegration({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, showLoading, hideLoading } = useLoadingScreen();

  const generateInvoice = async () => {
    showLoading('Generating invoice...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const invoice = {
        id: Date.now().toString(),
        amount: 5000,
        date: new Date().toISOString(),
      };
      
      localStorage.setItem(`invoice-${invoice.id}`, JSON.stringify(invoice));
      toast.success('Invoice generated successfully!');
      
      return invoice;
    } finally {
      hideLoading();
    }
  };

  const sendInvoice = async () => {
    showLoading('Sending invoice...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Invoice sent successfully!');
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      {isLoading && <LottieLoadingScreen isDarkMode={isDarkMode} />}
      
      <div className="p-6">
        <h1>Billing Example</h1>
        <button onClick={generateInvoice}>Generate Invoice</button>
        <button onClick={sendInvoice}>Send Invoice</button>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 10: Error Handling
// ============================================================================
export function Example10_ErrorHandling({ isDarkMode }: { isDarkMode: boolean }) {
  const { isLoading, withLoading } = useLoadingScreen();

  const handleOperationWithError = async () => {
    try {
      await withLoading(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          throw new Error('Something went wrong!');
        },
        'Processing...'
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {isLoading && <LottieLoadingScreen isDarkMode={isDarkMode} />}
      
      <div className="p-6">
        <h1>Error Handling Example</h1>
        <button onClick={handleOperationWithError}>
          Trigger Error
        </button>
      </div>
    </>
  );
}
