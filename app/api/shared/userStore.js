/**
 * Shared User Store for Demo Mode
 * Enhanced with localStorage fallback for better persistence in serverless environments
 * In production, all data would come from Supabase
 */

// Global Map to persist demo users across multiple serverless invocations
let globalUsers = new Map();

// Try to load from localStorage if available (Vercel edge functions)
function loadFromStorage() {
  try {
    if (typeof global !== 'undefined' && global.localStorage) {
      const stored = global.localStorage.getItem('__kidz_users__');
      if (stored) {
        const data = JSON.parse(stored);
        globalUsers = new Map(data);
        console.log('[USER_STORE] Loaded users from storage:', data.length);
      }
    }
  } catch (e) {
    // localStorage not available in serverless context, continue with in-memory only
  }
}

// Call on module load
loadFromStorage();

// Helper to save to storage
function saveToStorage() {
  try {
    if (typeof global !== 'undefined' && global.localStorage) {
      const data = Array.from(globalUsers.entries());
      global.localStorage.setItem('__kidz_users__', JSON.stringify(data));
    }
  } catch (e) {
    // Storage not available, continue
  }
}

export const userStore = {
  /**
   * Add a user to the store
   */
  addUser(email, userData) {
    const normalizedEmail = email.toLowerCase().trim();
    globalUsers.set(normalizedEmail, userData);
    saveToStorage();
    console.log('[USER_STORE] User added:', normalizedEmail);
  },

  /**
   * Get user by email
   */
  getUser(email) {
    const normalizedEmail = email.toLowerCase().trim();
    return globalUsers.get(normalizedEmail);
  },

  /**
   * Check if user exists
   */
  userExists(email) {
    const normalizedEmail = email.toLowerCase().trim();
    return globalUsers.has(normalizedEmail);
  },

  /**
   * Update user
   */
  updateUser(email, userData) {
    const normalizedEmail = email.toLowerCase().trim();
    if (globalUsers.has(normalizedEmail)) {
      globalUsers.set(normalizedEmail, userData);
      saveToStorage();
      console.log('[USER_STORE] User updated:', normalizedEmail);
      return true;
    }
    return false;
  },

  /**
   * Delete user
   */
  deleteUser(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const result = globalUsers.delete(normalizedEmail);
    saveToStorage();
    return result;
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
    saveToStorage();
    console.log('[USER_STORE] All users cleared');
  },

  /**
   * Get store size (for debugging)
   */
  size() {
    return globalUsers.size;
  },
};

export default userStore;
