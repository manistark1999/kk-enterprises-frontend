
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { LottieLoadingScreen } from '@/components/shared/LottieLoadingScreen';
import { SignInPage } from '@/pages/auth/SignInPage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';
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
import { RolesScreen } from '@/pages/settings/RolesScreen';
import { FinancialYearScreen } from '@/pages/settings/FinancialYearScreen';
import { HistoryScreen } from '@/pages/settings/HistoryScreen';
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
import { BankTransactionProvider } from '@/contexts/BankTransactionContext';
import { SupplierProvider } from '@/contexts/SupplierContext';
import { BankAccountsProvider } from '@/contexts/BankAccountsContext';
import { TransportProvider } from '@/contexts/TransportContext';
import { PurchaseProvider } from '@/contexts/PurchaseContext';
import { SalesProvider } from '@/contexts/SalesContext';
import { JobCardScreenUnified } from '@/pages/job-card/JobCardScreenUnified';
import { JobCardProvider } from '@/contexts/JobCardContext';
import { EstimationProvider } from '@/contexts/EstimationContext';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { PermissionGuard } from '@/components/shared/PermissionGuard';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { DashboardRefreshProvider } from '@/contexts/DashboardRefreshContext';


interface MainLayoutProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

function MainLayout({ isDarkMode, setIsDarkMode }: MainLayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [showBackupPanel, setShowBackupPanel] = useState(false);
    const [showRestorePanel, setShowRestorePanel] = useState(false);
    const [isReceiptPanelOpen, setIsReceiptPanelOpen] = useState(false);
    const [isAlignmentPanelOpen, setIsAlignmentPanelOpen] = useState(false);
    const { withActionLoading } = useLoading();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (screen: string, data?: any) => {
        withActionLoading(() => {
            navigate(`/${screen}`, { state: data });
        }, `Navigating to ${screen.charAt(0).toUpperCase() + screen.slice(1)}...`);
    };

    // Close mobile sidebar when route changes
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div 
          className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''} print:min-h-0 print:overflow-visible print:bg-white`}
          style={{
            backgroundImage: isDarkMode 
              ? 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)'
              : 'none',
            backgroundColor: isDarkMode ? undefined : '#f5f7fb',
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
            <div className="no-print">
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
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
                onMobileOpen={() => setIsMobileSidebarOpen(true)}
              />
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <div className="no-print">
                <TopBar 
                  isDarkMode={isDarkMode}
                  onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                  showBackupPanel={showBackupPanel}
                  onCloseBackupPanel={() => setShowBackupPanel(false)}
                  showRestorePanel={showRestorePanel}
                  onCloseRestorePanel={() => setShowRestorePanel(false)}
                  onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  isCollapsed={isSidebarCollapsed}
                />
              </div>
              
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

  // REMOVED: Automatic redirection from Login page. 
  // The user explicitly requested that the Login page be visible first.

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Remove initial splash screen once React mounts
  useEffect(() => {
    // Show loading screen immediately then remove
    setIsInitialLoading(false);
    document.body.classList.add('loaded');
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
        {((isLoading && location.pathname !== '/') || isGlobalLoading) && (
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
        <Route path="/" element={<SignInPage isDarkMode={isDarkMode} />} />
        <Route path="/signin" element={<Navigate to="/" replace />} />
        
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute isDarkMode={isDarkMode}>
              <ChangePasswordPage isDarkMode={isDarkMode} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/*"
          element={
            <ProtectedRoute isDarkMode={isDarkMode}>
              <MainLayout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} />} />
          {/* Billing Modules */}
          <Route path="job-card" element={<PermissionGuard module="Job Card"><JobCardScreenUnified isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="job-card-form" element={<PermissionGuard module="Job Card"><JobCardScreenUnified isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="labour" element={<PermissionGuard module="Labour Bill"><LabourBillScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} /></PermissionGuard>} />
          <Route path="labour-history" element={<PermissionGuard module="Labour Bill"><LabourBillHistoryScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} /></PermissionGuard>} />
          <Route path="estimation" element={<PermissionGuard module="Estimation"><EstimationScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} /></PermissionGuard>} />
          <Route path="estimation-history" element={<PermissionGuard module="Estimation"><EstimationHistoryScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} /></PermissionGuard>} />
          
          {/* Inventory Modules */}
          <Route path="sales" element={<PermissionGuard module="Sales"><SalesScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} /></PermissionGuard>} />
          <Route path="purchase" element={<PermissionGuard module="Purchase"><PurchaseScreen isDarkMode={isDarkMode} onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })} /></PermissionGuard>} />
          <Route path="stock-adjustment" element={<PermissionGuard module="Stock Adjustment"><StockAdjustmentScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="stock-list" element={<PermissionGuard module="Stock List"><StockListScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          
          {/* Accounts Modules */}
          <Route path="payment" element={<PermissionGuard module="Payment"><PaymentScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="receipt" element={<PermissionGuard module="Receipt"><ReceiptScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="expense" element={<PermissionGuard module="Expense Entry"><ExpenseScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="advance" element={<PermissionGuard module="Staff Advance"><AdvanceScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="salary" element={<PermissionGuard module="Salary Entry"><SalaryScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="bank-ledger" element={<PermissionGuard module="Bank Ledger"><BankLedgerScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="cash-register" element={<PermissionGuard module="Cash Entry"><CashRegisterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          
          {/* Reports Modules */}
          <Route path="alignment-register" element={<PermissionGuard module="Alignment Register"><AlignmentRegisterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="expense-register" element={<PermissionGuard module="Expense Register"><ExpenseRegisterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="receipt-register" element={<PermissionGuard module="Receipt Register"><ReceiptRegisterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="cash-register-report" element={<PermissionGuard module="Cash Register"><CashRegisterReportScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="stock-adjustments-register" element={<PermissionGuard module="Stock Adjustments Register"><StockAdjustmentsRegisterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="stock-report" element={<PermissionGuard module="Stock Report"><StockReportScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="stock-register" element={<PermissionGuard module="Stock Register"><StockRegisterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="gst-report" element={<PermissionGuard module="GST Report"><GSTReportScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="mis-report" element={<PermissionGuard module="MIS Report"><MISReportScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="outstanding-report" element={<PermissionGuard module="Reports"><OutstandingReportScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          
          {/* Masters Modules */}
          <Route path="customer" element={<PermissionGuard module="Customer"><CustomerMasterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="transport" element={<PermissionGuard module="Transport"><TransportMasterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="vehicle-make" element={<PermissionGuard module="Vehicle Make"><VehicleMakeScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="vehicle-register" element={<PermissionGuard module="Vehicle Register"><VehicleRegisterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="work-group" element={<PermissionGuard module="Work Group"><WorkGroupScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="work-type" element={<PermissionGuard module="Work Type"><WorkTypeScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="supplier" element={<PermissionGuard module="Supplier"><SupplierScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="brand" element={<PermissionGuard module="Brand"><BrandScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="item" element={<PermissionGuard module="Item"><ItemsServicesScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="bank-accounts" element={<PermissionGuard module="Bank Accounts"><BankAccountsScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="staff" element={<PermissionGuard module="Staff"><StaffMasterScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="alignment" element={<PermissionGuard module="Dashboard"><AlignmentScreen isDarkMode={isDarkMode} /></PermissionGuard>} />

          {/* Settings Modules */}
          <Route path="company" element={<PermissionGuard module="Company"><CompanyScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="financial-year" element={<PermissionGuard module="Financial Year"><FinancialYearScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="user-management" element={<PermissionGuard module="User Management"><UserManagementScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="role-management" element={<PermissionGuard module="Role Management"><RolesScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          <Route path="history" element={<PermissionGuard module="History"><HistoryScreen isDarkMode={isDarkMode} /></PermissionGuard>} />
          
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
        <DashboardRefreshProvider>
          <StockProvider>
            <LabourBillProvider>
              <EstimationProvider>
                <JobCardProvider>
                <VehicleRegistryProvider>
                  <ItemsServicesProvider>
                    <MastersProvider>
                      <TransactionsProvider>
                        <CustomerProvider>
                          <ReceiptsPaymentsProvider>
                            <AlignmentProvider>
                              <StaffProvider>
            <BankTransactionProvider>
                                <SupplierProvider>
                                  <BankAccountsProvider>
                                    <TransportProvider>
                                      <PurchaseProvider>
                                        <SalesProvider>
                                          <CompanyProvider>
                                            <AppContent />
                                          </CompanyProvider>
                                        </SalesProvider>
                                      </PurchaseProvider>
                                    </TransportProvider>
                                  </BankAccountsProvider>
                                </SupplierProvider>
            </BankTransactionProvider>
                              </StaffProvider>
                            </AlignmentProvider>
                          </ReceiptsPaymentsProvider>
                        </CustomerProvider>
                      </TransactionsProvider>
                    </MastersProvider>
                  </ItemsServicesProvider>
                </VehicleRegistryProvider>
                </JobCardProvider>
              </EstimationProvider>
            </LabourBillProvider>
          </StockProvider>
        </DashboardRefreshProvider>
      </AuthProvider>
    </NotificationProvider>
  </LoadingProvider>
</ErrorBoundary>
  );
}