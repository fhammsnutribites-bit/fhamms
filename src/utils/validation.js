/**
 * Validation utility functions
 */

/**
 * Validates Indian mobile number format
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} True if valid Indian mobile number
 */
export const validateIndianMobile = (mobile) => {
  if (!mobile) return false;

  // Remove any spaces, hyphens, or other non-digit characters except +
  const cleanMobile = mobile.replace(/[^\d+]/g, '');

  // Check if it starts with +91 or just 10 digits
  const indianMobileRegex = /^(\+91)?[6-9]\d{9}$/;

  return indianMobileRegex.test(cleanMobile);
};

/**
 * Formats mobile number to standard format (+91XXXXXXXXXX)
 * @param {string} mobile - Mobile number to format
 * @returns {string} Formatted mobile number
 */
export const formatIndianMobile = (mobile) => {
  if (!mobile) return '';

  // Remove any non-digit characters
  const digitsOnly = mobile.replace(/\D/g, '');

  // If it starts with 91, add + prefix
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }

  // If it's 10 digits, add +91 prefix
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  // Return as is if already properly formatted
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }

  return mobile;
};

/**
 * Gets validation error message for mobile number
 * @param {string} mobile - Mobile number to validate
 * @returns {string|null} Error message or null if valid
 */
export const getMobileValidationError = (mobile) => {
  if (!mobile || mobile.trim() === '') {
    return 'Mobile number is required';
  }

  if (!validateIndianMobile(mobile)) {
    return 'Please enter a valid Indian mobile number (10 digits starting with 6-9)';
  }

  return null;
};