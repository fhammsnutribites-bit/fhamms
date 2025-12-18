/**
 * Order utility functions for consistent formatting and display
 */

/**
 * Format order number for consistent display across admin and customer pages
 * @param {string} orderId - MongoDB ObjectId of the order
 * @returns {string} Formatted order number (e.g., "ORD-ABC12345")
 */
export const formatOrderNumber = (orderId) => {
  if (!orderId) return 'N/A';

  // Take last 8 characters of ObjectId and format as order number
  const shortId = orderId.slice(-8).toUpperCase();
  return `ORD-${shortId}`;
};

/**
 * Get display order number for UI components
 * @param {string} orderId - MongoDB ObjectId of the order
 * @param {boolean} showPrefix - Whether to include "Order #" prefix
 * @returns {string} Display order number
 */
export const getDisplayOrderNumber = (orderId, showPrefix = true) => {
  const formattedNumber = formatOrderNumber(orderId);
  return showPrefix ? `Order ${formattedNumber}` : formattedNumber;
};

/**
 * Get order status display text and color
 * @param {string} paymentStatus - Payment status
 * @param {boolean} isDelivered - Delivery status
 * @param {string} deliveryStatus - Delivery status
 * @returns {Object} Status info with text and color
 */
export const getOrderStatus = (paymentStatus, isDelivered, deliveryStatus) => {
  // If delivered, show delivered status
  if (isDelivered || deliveryStatus === 'delivered') {
    return { text: 'Delivered', color: '#2e7d32', bgColor: '#e8f5e9' };
  }

  // Check delivery status first for more detailed info
  if (deliveryStatus) {
    switch (deliveryStatus) {
      case 'pending':
        return { text: 'Order Placed', color: '#f57c00', bgColor: '#fff3e0' };
      case 'processing':
        return { text: 'Processing', color: '#1976d2', bgColor: '#e3f2fd' };
      case 'shipped':
        return { text: 'Shipped', color: '#7b1fa2', bgColor: '#f3e5f5' };
      case 'out_for_delivery':
        return { text: 'Out for Delivery', color: '#f57c00', bgColor: '#fff3e0' };
      case 'delivered':
        return { text: 'Delivered', color: '#2e7d32', bgColor: '#e8f5e9' };
      case 'cancelled':
        return { text: 'Cancelled', color: '#d32f2f', bgColor: '#ffebee' };
      default:
        break;
    }
  }

  // Fallback to payment status
  switch (paymentStatus) {
    case 'success':
      return { text: 'Paid', color: '#2e7d32', bgColor: '#e8f5e9' };
    case 'failed':
      return { text: 'Payment Failed', color: '#d32f2f', bgColor: '#ffebee' };
    case 'cancelled':
      return { text: 'Cancelled', color: '#f57c00', bgColor: '#fff3e0' };
    case 'pending':
    default:
      return { text: 'Pending', color: '#f57c00', bgColor: '#fff3e0' };
  }
};

/**
 * Get delivery status options for admin dropdown
 * @returns {Array} Array of delivery status options
 */
export const getDeliveryStatusOptions = () => [
  { value: 'pending', label: 'Order Placed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

/**
 * Format order date for display
 * @param {string|Date} date - Order creation date
 * @param {string} format - Date format ('short' or 'long')
 * @returns {string} Formatted date string
 */
export const formatOrderDate = (date, format = 'long') => {
  if (!date) return 'N/A';

  const orderDate = new Date(date);

  if (format === 'short') {
    return orderDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
