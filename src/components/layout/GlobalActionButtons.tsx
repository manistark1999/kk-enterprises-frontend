/**
 * Global Action Buttons Component
 * 
 * Provides consistent Refresh, Export, and Import functionality
 * across all module pages in the system.
 * 
 * Usage:
 * <GlobalActionButtons
 *   isDarkMode={isDarkMode}
 *   onRefresh={handleRefresh}
 *   onExport={handleExport}
 *   onImport={handleImport}
 *   moduleName="Labour Bill"
 *   showExport={true}
 *   showImport={true}
 * />
 */

import React, { useRef } from 'react';
import { RefreshCw, Download, Upload } from 'lucide-react';
import {
  getGlobalButtonClass,
  getExportButtonClass,
  getImportButtonClass
} from '@/utils/globalFeatures';

export interface GlobalActionButtonsProps {
  isDarkMode: boolean;
  onRefresh: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  moduleName?: string;
  showExport?: boolean;
  showImport?: boolean;
  customButtons?: React.ReactNode;
  isLoading?: boolean;
}

export function GlobalActionButtons({
  isDarkMode,
  onRefresh,
  onExport,
  onImport,
  moduleName = 'Data',
  showExport = true,
  showImport = false,
  customButtons,
  isLoading = false
}: GlobalActionButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefreshClick = () => {
    if (!isLoading) {
      onRefresh();
    }
  };

  const handleExportClick = () => {
    if (onExport && !isLoading) {
      onExport();
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
      // Reset input so same file can be uploaded again
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Refresh Button - Always visible */}
      <button
        type="button"
        onClick={handleRefreshClick}
        disabled={isLoading}
        className={`${getGlobalButtonClass(isDarkMode)} disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`Refresh ${moduleName}`}
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>

      {/* Export Button - Conditional */}
      {showExport && onExport && (
        <button
          type="button"
          onClick={handleExportClick}
          disabled={isLoading}
          className={`${getExportButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
          title={`Export ${moduleName} to Excel`}
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      )}

      {/* Import Button - Conditional */}
      {showImport && onImport && (
        <>
          <button
            type="button"
            onClick={handleImportClick}
            disabled={isLoading}
            className={`${getImportButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={`Import ${moduleName} from Excel`}
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload file"
          />
        </>
      )}

      {/* Custom Buttons */}
      {customButtons}
    </div>
  );
}
