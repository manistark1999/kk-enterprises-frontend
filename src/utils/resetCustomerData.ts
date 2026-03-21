/**
 * Utility to reset customer data in localStorage
 * Use this if you're experiencing issues with old/corrupted customer data
 */

export function resetCustomerData() {
  // Clear old customer data
  localStorage.removeItem('kk_customers');
  
  // The CustomerContext will automatically reinitialize with default data
  console.log('Customer data has been reset. Please refresh the page.');
  
  // Optionally reload the page
  if (window.confirm('Customer data has been cleared. Reload the page to see fresh data?')) {
    window.location.reload();
  }
}

// Add to window for easy access from console
if (typeof window !== 'undefined') {
  (window as any).resetCustomerData = resetCustomerData;
}
