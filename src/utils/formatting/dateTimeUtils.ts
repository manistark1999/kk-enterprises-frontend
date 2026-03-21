/**
 * Date and Time Utility Functions
 * Provides consistent date/time formatting across the application
 */

/**
 * Get current date in YYYY-MM-DD format for HTML date inputs
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current time in HH:MM format (24-hour) for HTML time inputs
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format time from 24-hour to 12-hour format with AM/PM
 */
export const formatTime12Hour = (time24: string): string => {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

/**
 * Get current timestamp for unique IDs
 */
export const getTimestamp = (): number => {
  return Date.now();
};

/**
 * Format date to display format (DD/MM/YYYY)
 */
export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Get current date and time as formatted string
 */
export const getCurrentDateTime = (): string => {
  const now = new Date();
  return `${formatDateDisplay(getCurrentDate())} ${formatTime12Hour(getCurrentTime())}`;
};

// Default export for better module compatibility
export default {
  getCurrentDate,
  getCurrentTime,
  formatTime12Hour,
  getTimestamp,
  formatDateDisplay,
  getCurrentDateTime
};