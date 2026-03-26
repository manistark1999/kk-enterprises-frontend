/**
 * Centralized Form Styling Constants for KK Enterprises
 * Ensures consistent form layout across all management screens
 * Following form-layout-styles.css guidelines for professional UI
 */

export const FORM_CONSTANTS = {
  // Container widths - centered layout with max-width constraints
  FORM_MAX_WIDTH: 'max-w-[1100px]', // Large forms (900px-1100px as per guidelines)
  FORM_MEDIUM_WIDTH: 'max-w-[1000px]', // Medium forms
  FORM_SMALL_WIDTH: 'max-w-[900px]', // Small forms
  
  // Margins and spacing - centered alignment
  FORM_MARGIN: 'mx-auto', // Center alignment (margin: 0 auto)
  FORM_TOP_MARGIN: 'mt-6', // Top spacing (20px-30px)
  FORM_PADDING: 'p-7', // Internal padding (24px-32px)
  SECTION_SPACING: 'space-y-6',
  FIELD_GAP: 'gap-5', // Gap between form fields (16px-20px)
  
  // Form heights - consistent input heights
  INPUT_HEIGHT: 'h-12', // Standard input height (48px as per 42px-48px guideline)
  BUTTON_HEIGHT: 'h-12', // Standard button height (48px)
  TEXTAREA_MIN_HEIGHT: 'min-h-[100px]',
  
  // Responsive column layout - 2-column grid structure
  TWO_COLUMN_GRID: 'grid grid-cols-1 lg:grid-cols-2',
  THREE_COLUMN_GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  FOUR_COLUMN_GRID: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  
  // Padding and spacing constants
  CARD_PADDING: 'p-7', // 24px-32px
  SECTION_PADDING: 'p-6',
  HEADER_PADDING: 'p-6',
  TABLE_PADDING: 'p-6',
  
  // Gap constants - equal spacing between fields
  SECTION_GAP: 'gap-6', // 16px-20px between rows
  CARD_GAP: 'gap-4',
  BUTTON_GAP: 'gap-4', // 12px-16px spacing between buttons
  
  // Border radius
  CARD_RADIUS: 'rounded-xl', // 10px-12px
  INPUT_RADIUS: 'rounded-lg',
  
  // Label spacing
  LABEL_MARGIN: 'mb-2', // 6px-8px above inputs
};

/**
 * Get card class with glassmorphic styling
 */
export const getCardClass = (isDarkMode: boolean): string => {
  return `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg !overflow-visible`;
};

/**
 * Get input class with consistent styling (44px height)
 */
export const getInputClass = (isDarkMode: boolean): string => {
  return `w-full px-4 py-2.5 ${FORM_CONSTANTS.INPUT_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
  }`;
};

/**
 * Get textarea class with consistent styling
 */
export const getTextareaClass = (isDarkMode: boolean): string => {
  return `w-full px-4 py-2.5 ${FORM_CONSTANTS.TEXTAREA_MIN_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} border transition-all outline-none text-sm resize-none ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
  }`;
};

/**
 * Get label class with consistent styling
 */
export const getLabelClass = (isDarkMode: boolean, showError: boolean = false): string => {
  const baseClass = `block text-sm font-semibold ${FORM_CONSTANTS.LABEL_MARGIN}`;
  const colorClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const errorClass = showError ? 'text-red-500' : colorClass;
  
  return `${baseClass} ${errorClass}`;
};

/**
 * Render label with required asterisk and optional error state
 */
export const renderLabel = (labelText: string, isRequired: boolean, isDarkMode: boolean, showError: boolean = false) => {
  return (
    <label className={getLabelClass(isDarkMode, showError)}>
      {labelText}
      {isRequired && <span className="text-red-500 ml-1 italic font-bold">*</span>}
    </label>
  );
};

/**
 * Helper to check if field is empty
 */
export const isFieldEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return false; 
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

/**
 * Get input class with validation styling
 */
export const getInputClassWithValidation = (isDarkMode: boolean, hasError: boolean = false): string => {
  const baseClass = `w-full px-4 py-2.5 ${FORM_CONSTANTS.INPUT_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} border transition-all outline-none text-sm`;
  
  if (hasError) {
    return `${baseClass} ${
      isDarkMode
        ? 'bg-gray-700/50 border-red-500 text-white placeholder-gray-400 focus:border-red-500 focus:bg-gray-700 focus:ring-2 focus:ring-red-500/20'
        : 'bg-white border-red-500 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20'
    }`;
  }
  
  return `${baseClass} ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
  }`;
};

/**
 * Get textarea class with validation styling
 */
export const getTextareaClassWithValidation = (isDarkMode: boolean, hasError: boolean = false): string => {
  const baseClass = `w-full px-4 py-2.5 ${FORM_CONSTANTS.TEXTAREA_MIN_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} border transition-all outline-none text-sm resize-none`;
  
  if (hasError) {
    return `${baseClass} ${
      isDarkMode
        ? 'bg-gray-700/50 border-red-500 text-white placeholder-gray-400 focus:border-red-500 focus:bg-gray-700 focus:ring-2 focus:ring-red-500/20'
        : 'bg-white border-red-500 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20'
    }`;
  }
  
  return `${baseClass} ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
  }`;
};

/**
 * Get select/dropdown class with validation styling
 */
export const getSelectClassWithValidation = (isDarkMode: boolean, hasError: boolean = false): string => {
  const baseClass = `w-full px-4 py-2.5 ${FORM_CONSTANTS.INPUT_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} border transition-all outline-none text-sm appearance-none bg-no-repeat bg-right pr-10 cursor-pointer`;
  const chevron = isDarkMode 
    ? "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19.5%208.25-7.5%207.5-7.5-7.5%22%2F%3E%3C%2Fsvg%3E')]"
    : "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19.5%208.25-7.5%207.5-7.5-7.5%22%2F%3E%3C%2Fsvg%3E')]";

  if (hasError) {
    return `${baseClass} ${chevron} bg-[length:1.25rem] bg-[position:calc(100%-1rem)_50%] ${
      isDarkMode
        ? 'bg-gray-700/50 border-red-500 text-white focus:border-red-500 focus:bg-gray-700 focus:ring-2 focus:ring-red-500/20'
        : 'bg-white border-red-500 text-gray-900 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20'
    }`;
  }
  
  return `${baseClass} ${chevron} bg-[length:1.25rem] bg-[position:calc(100%-1rem)_50%] ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
  }`;
};

/**
 * Get select/dropdown class with consistent styling (44px height)
 */
export const getSelectClass = (isDarkMode: boolean): string => {
  const baseClass = `w-full px-4 py-2.5 ${FORM_CONSTANTS.INPUT_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} border transition-all outline-none text-sm appearance-none bg-no-repeat bg-right pr-10 cursor-pointer`;
  const chevron = isDarkMode 
    ? "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19.5%208.25-7.5%207.5-7.5-7.5%22%2F%3E%3C%2Fsvg%3E')]"
    : "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19.5%208.25-7.5%207.5-7.5-7.5%22%2F%3E%3C%2Fsvg%3E')]";

  return `${baseClass} ${chevron} bg-[length:1.25rem] bg-[position:calc(100%-1rem)_50%] ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
  }`;
};

/**
 * Get button class for primary actions (44px height)
 */
export const getPrimaryButtonClass = (): string => {
  return `flex items-center justify-center gap-2 px-6 py-2.5 ${FORM_CONSTANTS.BUTTON_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl`;
};

/**
 * Get button class for secondary actions (44px height)
 */
export const getSecondaryButtonClass = (isDarkMode: boolean): string => {
  return `flex items-center justify-center gap-2 px-6 py-2.5 ${FORM_CONSTANTS.BUTTON_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} border text-sm font-medium transition-all ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
  }`;
};

/**
 * Get page header class
 */
export const getPageHeaderClass = (isDarkMode: boolean): string => {
  return `text-3xl font-bold mb-1 ${
    isDarkMode ? 'text-white' : 'text-gray-900'
  }`;
};

/**
 * Get page subtitle class
 */
export const getPageSubtitleClass = (isDarkMode: boolean): string => {
  return `text-sm ${
    isDarkMode ? 'text-gray-400' : 'text-gray-600'
  }`;
};

/**
 * Get table header class
 */
export const getTableHeaderClass = (isDarkMode: boolean): string => {
  return `text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
    isDarkMode ? 'text-gray-400' : 'text-gray-600'
  }`;
};

/**
 * Get table cell class
 */
export const getTableCellClass = (isDarkMode: boolean): string => {
  return `py-3 px-4 text-sm ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;
};

export const getIconButtonClass = (isDarkMode: boolean, variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gray' = 'primary'): string => {
  const themes = {
    primary: isDarkMode 
      ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 shadow-sm border border-blue-500/20' 
      : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm border border-blue-100',
    
    // For secondary/neutral icons, we keep them blue but more subtle
    secondary: isDarkMode
      ? 'bg-blue-900/10 text-blue-500/80 hover:bg-blue-600/20 hover:text-blue-400'
      : 'bg-gray-50 text-blue-500 hover:bg-blue-50 hover:text-blue-600',

    // For dangerous/alert actions, we keep the blue theme but maybe a deeper blue or just high contrast blue
    // User asked to remove random reds, so we use high-contrast blue for "danger" or very subtle red if ABSOLUTELY necessary.
    // However, following the prompt strictly: "Remove all random colors like green, purple, red"
    danger: isDarkMode
      ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-600 hover:text-white'
      : 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white',

    success: isDarkMode
      ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/30'
      : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white',

    warning: isDarkMode
      ? 'bg-blue-900/20 text-blue-300 hover:bg-blue-800'
      : 'bg-blue-50 text-blue-600 hover:bg-blue-100',

    gray: isDarkMode
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };
  
  return `p-2 h-10 w-10 ${FORM_CONSTANTS.CARD_RADIUS} transition-all duration-300 inline-flex items-center justify-center cursor-pointer ${themes[variant]}`;
};

/**
 * Get modal container class
 */
export const getModalContainerClass = (isDarkMode: boolean): string => {
  return `${FORM_CONSTANTS.FORM_MEDIUM_WIDTH} ${FORM_CONSTANTS.FORM_MARGIN} relative`;
};

/**
 * Get modal overlay class - perfect center alignment with backdrop
 * Use this for all modal/popup backgrounds
 */
export const getModalOverlayClass = (): string => {
  return 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
};

/**
 * Get modal content class - centered modal with consistent width
 * Recommended width: 600px-700px
 */
export const getModalContentClass = (isDarkMode: boolean, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  const widths = {
    small: 'w-full max-w-[500px]',
    medium: 'w-full max-w-[650px]', // 600px-700px range
    large: 'w-full max-w-[800px]',
  };
  
  return `${widths[size]} ${FORM_CONSTANTS.CARD_RADIUS} ${getCardClass(isDarkMode)} max-h-[90vh] !overflow-visible shadow-2xl`;
};

/**
 * Get modal header class - consistent header styling
 */
export const getModalHeaderClass = (isDarkMode: boolean): string => {
  return `flex items-center justify-between ${FORM_CONSTANTS.HEADER_PADDING} border-b ${
    isDarkMode ? 'border-gray-700' : 'border-gray-200'
  }`;
};

/**
 * Get modal body class - consistent body padding
 */
export const getModalBodyClass = (): string => {
  return `${FORM_CONSTANTS.CARD_PADDING}`;
};

/**
 * Get modal footer class - button alignment (Save left, Cancel right)
 */
export const getModalFooterClass = (isDarkMode: boolean): string => {
  return `flex items-center justify-between ${FORM_CONSTANTS.HEADER_PADDING} border-t ${
    isDarkMode ? 'border-gray-700' : 'border-gray-200'
  }`;
};

/**
 * Get modal button group class - for Save (left) and Cancel (right) layout
 */
export const getModalButtonGroupClass = (): string => {
  return `flex items-center justify-between w-full ${FORM_CONSTANTS.BUTTON_GAP}`;
};

/**
 * Get modal grid class - 2-column layout for modal forms
 */
export const getModalGridClass = (): string => {
  return `${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.SECTION_GAP}`;
};

/**
 * Get full-width field class - for fields like Description that span full width
 */
export const getFullWidthFieldClass = (): string => {
  return 'col-span-1 lg:col-span-2';
};

/**
 * BUTTON UTILITIES
 * All buttons must have explicit type attribute to prevent form submission issues
 */

/**
 * Get button base props - Essential for preventing unintended form submissions
 */
export const getButtonBaseProps = (type: 'button' | 'submit' = 'button') => {
  return {
    type,
    // Prevent default behavior for button type
    onClick: type === 'button' ? (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
    } : undefined
  };
};

/**
 * Common button styles that work with primary/secondary classes
 */
export const BUTTON_BASE_CLASS = 'inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Get action button props - for Save, Submit buttons
 * Use this for buttons that should trigger form submission or data saving
 */
export const getActionButtonProps = () => {
  return {
    type: 'button' as const, // Explicitly button to control submission manually
  };
};

/**
 * Get cancel button props - for Cancel, Close buttons
 * Use this for buttons that should close modals without saving
 */
export const getCancelButtonProps = () => {
  return {
    type: 'button' as const, // Always button type for cancel actions
  };
};

/**
 * Get filter section class
 */
export const getFilterSectionClass = (): string => {
  return `flex flex-wrap items-center ${FORM_CONSTANTS.CARD_GAP}`;
};

/**
 * Get action button class (for table row actions)
 */
export const getActionButtonClass = (isDarkMode: boolean, variant: 'edit' | 'delete' | 'view' = 'edit'): string => {
  const variants = {
    edit: isDarkMode 
      ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/10' 
      : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm',
    
    delete: isDarkMode 
      ? 'bg-blue-900/30 text-blue-300 hover:bg-red-500/20 hover:text-red-400 border border-blue-800' 
      : 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white',
    
    view: isDarkMode 
      ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20' 
      : 'bg-blue-50 text-blue-500 hover:bg-blue-100',
  };
  
  return `p-2 ${FORM_CONSTANTS.INPUT_RADIUS} transition-all duration-300 ${variants[variant]}`;
};

/**
 * Get form container class - centered layout with max-width
 * Use this for all form containers to ensure consistent alignment
 */
export const getFormContainerClass = (size: 'small' | 'medium' | 'large' = 'medium'): string => {
  const widths = {
    small: FORM_CONSTANTS.FORM_SMALL_WIDTH,
    medium: FORM_CONSTANTS.FORM_MEDIUM_WIDTH,
    large: FORM_CONSTANTS.FORM_MAX_WIDTH,
  };
  
  return `${widths[size]} ${FORM_CONSTANTS.FORM_MARGIN} ${FORM_CONSTANTS.FORM_TOP_MARGIN}`;
};

/**
 * Get form grid class - 2-column responsive layout
 * Use this for form field grids
 */
export const getFormGridClass = (): string => {
  return `${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.SECTION_GAP}`;
};

/**
 * Get button group class - right aligned at bottom
 * Use this for Save/Cancel button groups
 */
export const getButtonGroupClass = (): string => {
  return `flex justify-end items-center ${FORM_CONSTANTS.BUTTON_GAP} mt-8`;
};

/**
 * Get form section class - for grouping related fields
 */
export const getFormSectionClass = (isDarkMode: boolean): string => {
  return `${getCardClass(isDarkMode)} ${FORM_CONSTANTS.CARD_PADDING}`;
};

/**
 * Get required field class with validation styling
 * Shows red border for empty required fields
 */
export const getRequiredFieldClass = (value: any, isDarkMode: boolean): string => {
  const isEmpty = isFieldEmpty(value);
  
  if (isEmpty) {
    // Show red border for empty required fields
    return `w-full px-4 py-2.5 ${FORM_CONSTANTS.INPUT_HEIGHT} ${FORM_CONSTANTS.INPUT_RADIUS} border transition-all outline-none text-sm ${
      isDarkMode
        ? 'bg-gray-700/50 border-red-500 text-white placeholder-gray-400 focus:border-red-500 focus:bg-gray-700 focus:ring-2 focus:ring-red-500/20'
        : 'bg-white border-red-500 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20'
    }`;
  }
  
  // Normal styling when field has value
  return getInputClass(isDarkMode);
};