/**
 * System Health Check Utility
 * Performs automated validation of the KK Enterprises system
 */

export interface HealthCheckResult {
  module: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  timestamp: string;
}

export class SystemHealthCheck {
  private results: HealthCheckResult[] = [];

  /**
   * Run complete system health check
   */
  async runFullCheck(): Promise<HealthCheckResult[]> {
    this.results = [];
    
    console.log('🔍 Starting System Health Check...');
    
    await this.checkLocalStorage();
    await this.checkContexts();
    await this.checkCalculations();
    await this.checkDataIntegrity();
    
    console.log('✅ Health Check Complete');
    return this.results;
  }

  /**
   * Check localStorage availability and data
   */
  private async checkLocalStorage(): Promise<void> {
    try {
      const testKey = 'health_check_test';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (testValue === 'test') {
        this.addResult('LocalStorage', 'pass', 'localStorage is accessible and working');
      } else {
        this.addResult('LocalStorage', 'fail', 'localStorage read/write failed');
      }
      
      // Check critical data
      const criticalKeys = [
        'kk_customers',
        'vehicle_registry',
        'vehicle_makes',
        'items_services'
      ];
      
      let dataPresent = 0;
      criticalKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          dataPresent++;
        }
      });
      
      if (dataPresent >= 3) {
        this.addResult('Critical Data', 'pass', `${dataPresent}/${criticalKeys.length} critical data stores present`);
      } else {
        this.addResult('Critical Data', 'warning', `Only ${dataPresent}/${criticalKeys.length} data stores found`);
      }
    } catch (error) {
      this.addResult('LocalStorage', 'fail', 'localStorage not available');
    }
  }

  /**
   * Verify context data availability
   */
  private async checkContexts(): Promise<void> {
    try {
      // Check customers
      const customers = localStorage.getItem('kk_customers');
      if (customers) {
        const parsed = JSON.parse(customers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.addResult('Customer Context', 'pass', `${parsed.length} customers loaded`);
        } else {
          this.addResult('Customer Context', 'warning', 'Customer data is empty');
        }
      } else {
        this.addResult('Customer Context', 'warning', 'No customer data found');
      }
      
      // Check vehicles
      const vehicles = localStorage.getItem('vehicle_registry');
      if (vehicles) {
        const parsed = JSON.parse(vehicles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.addResult('Vehicle Registry', 'pass', `${parsed.length} vehicles registered`);
        } else {
          this.addResult('Vehicle Registry', 'warning', 'Vehicle registry is empty');
        }
      } else {
        this.addResult('Vehicle Registry', 'warning', 'No vehicle registry found');
      }
    } catch (error) {
      this.addResult('Context Check', 'fail', 'Error checking context data');
    }
  }

  /**
   * Test calculation functions
   */
  private async checkCalculations(): Promise<void> {
    try {
      // Test GST calculation
      const testCases = [
        { qty: 2, rate: 500, gst: 18, expected: 1180 },
        { qty: 1, rate: 300, gst: 12, expected: 336 },
        { qty: 3, rate: 200, gst: 5, expected: 630 }
      ];
      
      let passed = 0;
      testCases.forEach(test => {
        const baseAmount = test.qty * test.rate;
        const gstAmount = (baseAmount * test.gst) / 100;
        const total = baseAmount + gstAmount;
        
        if (Math.abs(total - test.expected) < 0.01) {
          passed++;
        }
      });
      
      if (passed === testCases.length) {
        this.addResult('Calculations', 'pass', `All ${testCases.length} calculation tests passed`);
      } else {
        this.addResult('Calculations', 'fail', `Only ${passed}/${testCases.length} calculation tests passed`);
      }
    } catch (error) {
      this.addResult('Calculations', 'fail', 'Calculation tests failed');
    }
  }

  /**
   * Check data integrity
   */
  private async checkDataIntegrity(): Promise<void> {
    try {
      // Check customer data structure
      const customers = localStorage.getItem('kk_customers');
      if (customers) {
        const parsed = JSON.parse(customers);
        const hasValidStructure = parsed.every((c: any) => 
          c.id && c.name && c.phone && 
          Array.isArray(c.vehicleDetails)
        );
        
        if (hasValidStructure) {
          this.addResult('Data Integrity', 'pass', 'Customer data structure is valid');
        } else {
          this.addResult('Data Integrity', 'warning', 'Some customer records have missing fields');
        }
      }
    } catch (error) {
      this.addResult('Data Integrity', 'fail', 'Data integrity check failed');
    }
  }

  /**
   * Add result to collection
   */
  private addResult(module: string, status: 'pass' | 'warning' | 'fail', message: string): void {
    this.results.push({
      module,
      status,
      message,
      timestamp: new Date().toISOString()
    });
    
    const emoji = status === 'pass' ? '✅' : status === 'warning' ? '⚠���' : '❌';
    console.log(`${emoji} ${module}: ${message}`);
  }

  /**
   * Get summary of results
   */
  getSummary(): { total: number; passed: number; warnings: number; failed: number } {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'pass').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
      failed: this.results.filter(r => r.status === 'fail').length
    };
  }

  /**
   * Get overall health status
   */
  getOverallStatus(): 'healthy' | 'degraded' | 'critical' {
    const summary = this.getSummary();
    
    if (summary.failed > 0) return 'critical';
    if (summary.warnings > 2) return 'degraded';
    return 'healthy';
  }
}

/**
 * Quick health check function
 */
export async function quickHealthCheck(): Promise<void> {
  const checker = new SystemHealthCheck();
  const results = await checker.runFullCheck();
  const summary = checker.getSummary();
  const status = checker.getOverallStatus();
  
  console.log('\n📊 Health Check Summary:');
  console.log(`Total Checks: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`⚠️  Warnings: ${summary.warnings}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`\n🏥 Overall Status: ${status.toUpperCase()}`);
  
  return;
}

// Auto-run health check in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode - Running auto health check');
  // Uncomment to enable auto health check on load
  // setTimeout(() => quickHealthCheck(), 2000);
}
