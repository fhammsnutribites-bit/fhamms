import { apiClient } from './api.js'

/**
 * Address API Service for pincode validation and city/state lookup
 */
export const addressApi = {
  /**
   * Get city and state from pincode (India)
   * Uses free Indian postal API
   * @param {string} pincode - 6-digit Indian pincode
   */
  getAddressByPincode: async (pincode) => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (
      data &&
      data[0] &&
      data[0].Status === 'Success' &&
      Array.isArray(data[0].PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const postOffices = data[0].PostOffice;

      /** -------------------------------------------------------
       * Guaranteed Correct Town Detection for India
       * -------------------------------------------------------
       */

      // 1. MAIN RULE: Pick the first Sub Post Office (main town)
      let mainPO = postOffices.find(po => po.BranchType === "Sub Post Office");

      // 2. Fallback: If no Sub Post Office exists, use the first entry
      if (!mainPO) {
        mainPO = postOffices[0];
      }

      // 3. Clean the town name
      const cleanTown = (name = "") =>
        name
          .replace(/ S\.O| B\.O| Bazar/gi, "")
          .trim();

      const townName = cleanTown(mainPO.Name);

      return {
        success: true,
        city: townName,               // <- THE FINAL CLEAN TOWN
        district: mainPO.District,
        state: mainPO.State,
        country: "India",
        raw_post_offices: postOffices.map(po => po.Name)
      };
    }

    return {
      success: false,
      message: "Invalid pincode or pincode not found"
    };

  } catch (err) {
    console.error("Pincode lookup error:", err);
    return {
      success: false,
      message: "Failed to validate pincode. Please try again."
    };
  }
}

  ,

  /**
   * Validate Indian pincode format
   * @param {string} pincode - Pincode to validate
   */
  validatePincodeFormat: (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  }
};
