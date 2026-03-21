import '@/utils/error-fixes/pre-error-suppression';
import '@/utils/error-fixes/error-suppression';
import '@/utils/resetCustomerData';

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { LottieLoadingScreen } from '@/components/shared/LottieLoadingScreen';
import { SignInPage } from '@/pages/auth/SignInPage';
import { StockModal } from '@/components/modals/StockModal';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { LabourBillScreen } from '@/pages/billing/LabourBillScreen';
import { LabourBillHistoryScreen } from '@/pages/billing/LabourBillHistoryScreen';
import { EstimationScreen } from '@/pages/billing/EstimationScreen';
import { EstimationHistoryScreen } from '@/pages/billing/EstimationHistoryScreen';
import { SalesScreen } from '@/pages/inventory/SalesScreen';
import { PurchaseScreen } from '@/pages/inventory/PurchaseScreen';
import { PaymentScreenEnhanced as PaymentScreen } from '@/pages/billing/PaymentScreenEnhanced';
import { StockAdjustmentScreen } from '@/pages/inventory/StockAdjustmentScreen';
import { StockListScreen } from '@/pages/inventory/StockListScreen';
import { CashRegisterScreen } from '@/pages/accounts/CashRegisterScreen';
import { CashRegisterReportScreen } from '@/pages/reports/CashRegisterReportScreen';
import { MISReportScreen } from '@/pages/reports/MISReportScreen';
import { StockReportScreen } from '@/pages/inventory/StockReportScreen';
import { StockRegisterScreen } from '@/pages/inventory/StockRegisterScreen';
import { StockAdjustmentsRegisterScreen } from '@/pages/inventory/StockAdjustmentsRegisterScreen';
import { OutstandingReportScreen } from '@/pages/reports/OutstandingReportScreen';
import { VehicleMakeScreenEnhanced as VehicleMakeScreen } from '@/pages/masters/VehicleMakeScreenEnhanced';
import { WorkGroupScreen } from '@/pages/masters/WorkGroupScreen';
import { WorkTypeScreen } from '@/pages/masters/WorkTypeScreen';
import { SupplierScreen } from '@/pages/masters/SupplierScreen';
import { BrandScreen } from '@/pages/masters/BrandScreen';
import { BankAccountsScreen } from '@/pages/masters/BankAccountsScreen';
import { ExpenseScreen } from '@/pages/accounts/ExpenseScreen';
import { ReceiptScreenEnhanced as ReceiptScreen } from '@/pages/billing/ReceiptScreenEnhanced';
import { AdvanceScreen } from '@/pages/accounts/AdvanceScreen';
import { SalaryScreen } from '@/pages/accounts/SalaryScreen';
import { ExpenseRegisterScreen } from '@/pages/accounts/ExpenseRegisterScreen';
import { ReceiptRegisterScreen } from '@/pages/billing/ReceiptRegisterScreenEnhanced';
import { GSTReportScreen } from '@/pages/reports/GSTReportScreen';
import { TransportMasterScreen } from '@/pages/masters/TransportMasterScreen';
import { StaffMasterScreen } from '@/pages/masters/StaffMasterScreen';
import { ItemsServicesScreen } from '@/pages/masters/ItemsServicesScreen';
import { VehicleRegisterScreen } from '@/pages/masters/VehicleRegisterScreen';
import { PaymentsVouchersScreen } from '@/pages/billing/PaymentsVouchersScreen';
import { CustomerMasterScreen } from '@/pages/masters/CustomerMasterScreen';
import { StockProvider } from '@/contexts/StockContext';
import { LabourBillProvider } from '@/contexts/LabourBillContext';
import { VehicleRegistryProvider } from '@/contexts/VehicleRegistryContext';
import { ItemsServicesProvider } from '@/contexts/ItemsServicesContext';
import { MastersProvider } from '@/contexts/MastersContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { ReceiptsPaymentsProvider } from '@/contexts/ReceiptsPaymentsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { UserManagementScreen } from '@/pages/settings/UserManagementScreen';
import { FinancialYearScreen } from '@/pages/settings/FinancialYearScreen';
import { AlignmentRegisterScreen } from '@/pages/alignment/AlignmentRegisterScreen';
import { AlignmentScreen } from '@/pages/alignment/AlignmentScreen';
import { BankLedgerScreen } from '@/pages/accounts/BankLedgerScreen';
import { CompanyScreen } from '@/pages/settings/CompanyScreen';
import { ReceiptPanel } from '@/components/panels/ReceiptPanel';
import { AlignmentEntryPanel } from '@/components/panels/AlignmentEntryPanel';
import { AlignmentProvider } from '@/contexts/AlignmentContext';
import { BackupPanel } from '@/components/panels/BackupPanel';
import { RestorePanel } from '@/components/panels/RestorePanel';
import { StaffProvider } from '@/contexts/StaffContext';
import { SupplierProvider } from '@/contexts/SupplierContext';
import { BankAccountsProvider } from '@/contexts/BankAccountsContext';
import { TransportProvider } from '@/contexts/TransportContext';
import { PurchaseProvider } from '@/contexts/PurchaseContext';
import { SalesProvider } from '@/contexts/SalesContext';
import { ERPIntegrationProvider } from '@/contexts/ERPIntegrationContext';
import { JobCardScreenUnified } from '@/pages/job-card/JobCardScreenUnified';
import { EstimationProvider } from '@/contexts/EstimationContext';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';
import { LoadingScreen } from '@/components/shared/LoadingScreen';


function MainLayout({ isDarkMode, setIsDarkMode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [showBackupPanel, setShowBackupPanel] = useState(false);
    const [showRestorePanel, setShowRestorePanel] = useState(false);
    const [isReceiptPanelOpen, setIsReceiptPanelOpen] = useState(false);
    const [isAlignmentPanelOpen, setIsAlignmentPanelOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (screen: any, data?: any) => {
        navigate(`/${screen}`, { state: data });
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsSidebarCollapsed(true);
            else setIsSidebarCollapsed(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div 
          className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}
          style={{
            backgroundImage: isDarkMode 
              ? 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)'
              : 'none',
            backgroundColor: isDarkMode ? undefined : '#ffffff',
            backgroundSize: '300% 300%',
            animation: isDarkMode ? 'gradientMove 12s ease infinite' : 'none'
          }}
        >
          <Toaster 
            position="top-right" 
            theme={isDarkMode ? 'dark' : 'light'}
            richColors
            closeButton
          />
          
          <motion.div
            className="relative z-10 flex h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Sidebar 
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              onNavigate={handleNavigate}
              onOpenBackup={() => setShowBackupPanel(true)}
              onOpenRestore={() => setShowRestorePanel(true)}
              onOpenReceiptPanel={() => setIsReceiptPanelOpen(true)}
              onOpenAlignmentPanel={() => setIsAlignmentPanelOpen(true)}
              currentScreen={location.pathname.substring(1)}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar 
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                showBackupPanel={showBackupPanel}
                onCloseBackupPanel={() => setShowBackupPanel(false)}
                showRestorePanel={showRestorePanel}
                onCloseRestorePanel={() => setShowRestorePanel(false)}
              />
              
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <StockModal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} isDarkMode={isDarkMode} />
            <ReceiptPanel isOpen={isReceiptPanelOpen} onClose={() => setIsReceiptPanelOpen(false)} isDarkMode={isDarkMode} />
            <AlignmentEntryPanel isDarkMode={isDarkMode} isOpen={isAlignmentPanelOpen} onClose={() => setIsAlignmentPanelOpen(false)} />
            <BackupPanel isOpen={showBackupPanel} onClose={() => setShowBackupPanel(false)} isDarkMode={isDarkMode} />
            <RestorePanel isOpen={showRestorePanel} onClose={() => setShowRestorePanel(false)} isDarkMode={isDarkMode} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/3 to-transparent pointer-events-none"></div>
        </div>
    );
}


function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoading: isGlobalLoading, loadingMessage } = useLoading();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Rigid authenticated user redirection: Keep users away from login if session is active
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/signin' || location.pathname === '/')) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      console.log(`[AppContent] Authenticated user at login route, moving to: ${from}`);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Remove initial splash screen once React mounts
  useEffect(() => {
    // Show loading screen for 3.5 seconds
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      document.body.classList.add('loaded');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Global error boundary & Figma error suppression
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const msg = String(event.error?.message || event.message || '');
      if (msg.includes('IframeMessageAbortError') || msg.includes('Message aborted')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', handleError, true);
    return () => window.removeEventListener('error', handleError, true);
  }, []);

  // Determine the best message to show
  const getLoadingMessage = () => {
    if (isLoading) {
      if (location.pathname === '/signin') return "Authenticating...";
      return "Checking system session...";
    }
    return loadingMessage || "Processing request...";
  };

  if (isInitialLoading) {
    return <LoadingScreen isDarkMode={isDarkMode} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <AnimatePresence>
        {(isLoading || isGlobalLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000]"
          >
            <LottieLoadingScreen 
              isDarkMode={isDarkMode} 
              message={getLoadingMessage()} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signin" element={<SignInPage isDarkMode={isDarkMode} />} />
        <Route 
          path="/*"
          element={
            <ProtectedRoute isDarkMode={isDarkMode}>
              <MainLayout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="job-card" element={<JobCardScreenUnified isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="job-card-form" element={<JobCardScreenUnified isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="labour" element={<LabourBillScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="labour-history" element={<LabourBillHistoryScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="estimation" element={<EstimationScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="estimation-history" element={<EstimationHistoryScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="sales" element={<SalesScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="purchase" element={<PurchaseScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          <Route path="payment" element={<PaymentScreen isDarkMode={isDarkMode} />} />
          <Route path="stock-adjustment" element={<StockAdjustmentScreen isDarkMode={isDarkMode} />} />
          <Route path="stock-list" element={<StockListScreen isDarkMode={isDarkMode} />} />
          <Route path="cash-register" element={<CashRegisterScreen isDarkMode={isDarkMode} />} />
          <Route path="cash-register-report" element={<CashRegisterReportScreen isDarkMode={isDarkMode} />} />
          <Route path="mis-report" element={<MISReportScreen isDarkMode={isDarkMode} />} />
          <Route path="stock-report" element={<StockReportScreen isDarkMode={isDarkMode} />} />
          <Route path="stock-register" element={<StockRegisterScreen isDarkMode={isDarkMode} />} />
          <Route path="stock-adjustments-register" element={<StockAdjustmentsRegisterScreen isDarkMode={isDarkMode} />} />
          <Route path="outstanding-report" element={<OutstandingReportScreen isDarkMode={isDarkMode} />} />
          <Route path="vehicle-make" element={<VehicleMakeScreen isDarkMode={isDarkMode} />} />
          <Route path="vehicle-register" element={<VehicleRegisterScreen isDarkMode={isDarkMode} />} />
          <Route path="work-group" element={<WorkGroupScreen isDarkMode={isDarkMode} />} />
          <Route path="work-type" element={<WorkTypeScreen isDarkMode={isDarkMode} />} />
          <Route path="supplier" element={<SupplierScreen isDarkMode={isDarkMode} />} />
          <Route path="brand" element={<BrandScreen isDarkMode={isDarkMode} />} />
          <Route path="bank-accounts" element={<BankAccountsScreen isDarkMode={isDarkMode} />} />
          <Route path="expense" element={<ExpenseScreen isDarkMode={isDarkMode} />} />
          <Route path="receipt" element={<ReceiptScreen isDarkMode={isDarkMode} />} />
          <Route path="advance" element={<AdvanceScreen isDarkMode={isDarkMode} />} />
          <Route path="salary" element={<SalaryScreen isDarkMode={isDarkMode} />} />
          <Route path="expense-register" element={<ExpenseRegisterScreen isDarkMode={isDarkMode} />} />
          <Route path="receipt-register" element={<ReceiptRegisterScreen isDarkMode={isDarkMode} />} />
          <Route path="gst-report" element={<GSTReportScreen isDarkMode={isDarkMode} />} />
          <Route path="transport" element={<TransportMasterScreen isDarkMode={isDarkMode} />} />
          <Route path="staff" element={<StaffMasterScreen isDarkMode={isDarkMode} />} />
          <Route path="item" element={<ItemsServicesScreen isDarkMode={isDarkMode} />} />
          <Route path="receipt-voucher" element={<PaymentsVouchersScreen isDarkMode={isDarkMode} />} />
          <Route path="user-management" element={<UserManagementScreen isDarkMode={isDarkMode} />} />
          <Route path="financial-year" element={<FinancialYearScreen isDarkMode={isDarkMode} />} />
          <Route path="alignment-register" element={<AlignmentRegisterScreen isDarkMode={isDarkMode} />} />
          <Route path="alignment" element={<AlignmentScreen isDarkMode={isDarkMode} />} />
          <Route path="bank-ledger" element={<BankLedgerScreen isDarkMode={isDarkMode} />} />
          <Route path="company" element={<CompanyScreen isDarkMode={isDarkMode} />} />
          <Route path="customer" element={<CustomerMasterScreen isDarkMode={isDarkMode} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </motion.div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <NotificationProvider>
        <AuthProvider>
          <StockProvider>
            <LabourBillProvider>
              <EstimationProvider>
                <VehicleRegistryProvider>
                  <ItemsServicesProvider>
                    <MastersProvider>
                      <TransactionsProvider>
                        <CustomerProvider>
                          <ReceiptsPaymentsProvider>
                            <AlignmentProvider>
                              <StaffProvider>
                                <SupplierProvider>
                                  <BankAccountsProvider>
                                    <TransportProvider>
                                      <PurchaseProvider>
                                        <SalesProvider>
                                          <ERPIntegrationProvider>
                                            <AppContent />
                                          </ERPIntegrationProvider>
                                        </SalesProvider>
                                      </PurchaseProvider>
                                    </TransportProvider>
                                  </BankAccountsProvider>
                                </SupplierProvider>
                              </StaffProvider>
                            </AlignmentProvider>
                          </ReceiptsPaymentsProvider>
                        </CustomerProvider>
                      </TransactionsProvider>
                    </MastersProvider>
                  </ItemsServicesProvider>
                </VehicleRegistryProvider>
              </EstimationProvider>
            </LabourBillProvider>
          </StockProvider>
        </AuthProvider>
      </NotificationProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}