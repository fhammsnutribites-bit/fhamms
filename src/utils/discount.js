/**
 * Calculate discounted price based on discount type and value
 * @param {number} originalPrice - Original price
 * @param {string} discountType - 'percentage' or 'fixed'
 * @param {number} discountValue - Discount value
 * @returns {number} Discounted price
 */
export const calculateDiscountedPrice = (originalPrice, discountType, discountValue) => {
  if (!discountType || !discountValue || discountValue <= 0) {
    return originalPrice;
  }

  if (discountType === 'percentage') {
    return originalPrice - (originalPrice * discountValue / 100);
  } else if (discountType === 'fixed') {
    return Math.max(0, originalPrice - discountValue);
  }

  return originalPrice;
};

/**
 * Get the best available weight option with complete data
 * Prioritizes weight options that have price and stock data
 * @param {Object} product - Product object
 * @returns {Object} Best weight option or null
 */
export const getBestWeightOption = (product) => {
  if (!product || !product.weightOptions || !Array.isArray(product.weightOptions)) {
    return null;
  }

  // Find weight options that have both price and stock
  const validOptions = product.weightOptions.filter(option =>
    option && option.price != null && option.stock != null && option.price > 0
  );

  if (validOptions.length === 0) return null;

  // Return the first valid option (they're typically ordered by weight)
  return validOptions[0];
};

/**
 * Get price information for a product (with discount calculation)
 * @param {Object} product - Product object
 * @param {Object} weightOption - Optional weight option
 * @returns {Object} Price info with original, discounted, hasDiscount, discountInfo
 */
export const getProductPriceInfo = (product, weightOption = null) => {
  if (!product) return null;

  let originalPrice;
  let discountType = null;
  let discountValue = null;
  let isDiscountActive = false;

  // Determine base price and discount from weight option or product
  if (weightOption) {
    originalPrice = weightOption.price;

    // Check weight option discount first
    if (weightOption.isDiscountActive && weightOption.discountType && weightOption.discountValue) {
      isDiscountActive = true;
      discountType = weightOption.discountType;
      discountValue = weightOption.discountValue;
    }
    // Fall back to product discount if weight option doesn't have one
    else if (product.isDiscountActive && product.discountType && product.discountValue) {
      isDiscountActive = true;
      discountType = product.discountType;
      discountValue = product.discountValue;
    }
  } else {
    // Try to get price from best weight option first
    const bestWeightOption = getBestWeightOption(product);
    if (bestWeightOption) {
      originalPrice = bestWeightOption.price;

      // Check weight option discount first
      if (bestWeightOption.isDiscountActive && bestWeightOption.discountType && bestWeightOption.discountValue) {
        isDiscountActive = true;
        discountType = bestWeightOption.discountType;
        discountValue = bestWeightOption.discountValue;
      }
      // Fall back to product discount
      else if (product.isDiscountActive && product.discountType && product.discountValue) {
        isDiscountActive = true;
        discountType = product.discountType;
        discountValue = product.discountValue;
      }
    } else {
      // Fall back to product price
      originalPrice = product.price || product.basePrice;
      if (product.isDiscountActive && product.discountType && product.discountValue) {
        isDiscountActive = true;
        discountType = product.discountType;
        discountValue = product.discountValue;
      }
    }
  }

  // Ensure we have a valid price
  if (originalPrice == null || originalPrice === 0) {
    return null;
  }

  const discountedPrice = isDiscountActive
    ? calculateDiscountedPrice(originalPrice, discountType, discountValue)
    : originalPrice;

  return {
    original: originalPrice,
    discounted: discountedPrice,
    hasDiscount: isDiscountActive,
    discountInfo: isDiscountActive ? { type: discountType, value: discountValue } : null
  };
};



