/**
 * Shared User Store for Demo Mode
 * Persists across endpoint invocations in serverless environment
 * In production, all data would come from Supabase
 */

// Global Map to persist demo users across multiple serverless invocations
let globalUsers = new Map();

export const userStore = {
  /**
   * Add a user to the store
   */
  addUser(email, userData) {
    globalUsers.set(email.toLowerCase(), userData);
    console.log('[USER_STORE] User added:', email);
  },

  /**
   * Get user by email
   */
  getUser(email) {
    return globalUsers.get(email.toLowerCase());
  },

  /**
   * Check if user exists
   */
  userExists(email) {
    return globalUsers.has(email.toLowerCase());
  },

  /**
   * Update user
   */
  updateUser(email, userData) {
    if (globalUsers.has(email.toLowerCase())) {
      globalUsers.set(email.toLowerCase(), userData);
      console.log('[USER_STORE] User updated:', email);
      return true;
    }
    return false;
  },

  /**
   * Delete user
   */
  deleteUser(email) {
    return globalUsers.delete(email.toLowerCase());
  },

  /**
   * Get all users (for debugging)
   */
  getAllUsers() {
    return Array.from(globalUsers.entries());
  },

  /**
   * Clear all users (for testing)
   */
  clear() {
    globalUsers.clear();
    console.log('[USER_STORE] All users cleared');
  },
};

export default userStore;
