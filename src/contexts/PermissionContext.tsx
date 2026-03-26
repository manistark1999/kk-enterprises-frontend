import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

/**
 * PermissionGate
 * Declarative wrapper — only renders children if user has the required permission.
 * 
 * Usage:
 *   <PermissionGate module="Labour Bill" action="create">
 *     <AddButton />
 *   </PermissionGate>
 * 
 *   <PermissionGate module="Customer" action="delete" fallback={<span>No access</span>}>
 *     <DeleteButton />
 *   </PermissionGate>
 */
interface PermissionGateProps {
  module: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'print' | 'export';
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ module, action = 'view', children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = useAuth();
  return hasPermission(module, action) ? <>{children}</> : <>{fallback}</>;
}

/**
 * usePermissions — convenience hook that returns all per-module helpers for a given module.
 * 
 * Usage:
 *   const { canView, canCreate, canEdit, canDelete, canPrint, canExport } = usePermissions('Job Card');
 */
export function usePermissions(moduleName: string) {
  const { hasPermission } = useAuth();
  return {
    canView:   hasPermission(moduleName, 'view'),
    canCreate: hasPermission(moduleName, 'create'),
    canEdit:   hasPermission(moduleName, 'edit'),
    canDelete: hasPermission(moduleName, 'delete'),
    canPrint:  hasPermission(moduleName, 'print'),
    canExport: hasPermission(moduleName, 'export'),
  };
}
