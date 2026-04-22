/**
 * PaymentChecker.js
 * 
 * Purpose: Check if user has completed payment/is premium
 * Features:
 * - Check payment status
 * - Check premium status
 * - Return user payment info
 */

import { authAPI, paymentAPI } from './api';

/**
 * Check if user is premium (has completed payment)
 * @returns {Promise<boolean>} - true if user is premium
 */
export const checkIsPremium = async () => {
  try {
    const userResponse = await authAPI.getCurrentUser();
    const user = userResponse.data?.user || userResponse.data;
    
    // Check isPremium flag
    return user?.isPremium === true || user?.premium === true;
  } catch (error) {
    console.error('[PAYMENT-CHECK] Error checking premium status:', error);
    return false; // Default to non-premium if error
  }
};

/**
 * Get user payment status with details
 * @returns {Promise<Object>} - payment status object
 */
export const getUserPaymentStatus = async () => {
  try {
    const userResponse = await authAPI.getCurrentUser();
    const user = userResponse.data?.user || userResponse.data;
    
    return {
      isPremium: user?.isPremium === true || user?.premium === true,
      paymentDate: user?.paymentDate || user?.paid_at,
      subscriptionActive: user?.subscriptionActive !== false,
      email: user?.email,
      userId: user?.id
    };
  } catch (error) {
    console.error('[PAYMENT-CHECK] Error fetching payment status:', error);
    return {
      isPremium: false,
      paymentDate: null,
      subscriptionActive: false,
      email: null,
      userId: null
    };
  }
};

/**
 * Check if specific order has been paid
 * @param {number|string} orderId - order ID to check
 * @returns {Promise<boolean>} - true if order is paid
 */
export const checkOrderPaid = async (orderId) => {
  try {
    if (paymentAPI.checkOrderStatus) {
      const response = await paymentAPI.checkOrderStatus(orderId);
      return response.data?.paid === true || response.data?.status === 'completed';
    }
    return false;
  } catch (error) {
    console.error('[PAYMENT-CHECK] Error checking order status:', error);
    return false;
  }
};

export default {
  checkIsPremium,
  getUserPaymentStatus,
  checkOrderPaid
};
