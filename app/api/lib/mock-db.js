/**
 * Mock Database Store - Shared across requests
 * This simulates database storage for testing
 */

// This persists during container lifetime on Vercel
export const mockDB = {
  users: {},
  nextId: 1000,

  findUserByEmail(email) {
    return this.users[email] || null;
  },

  createUser(name, email, passwordHash, preferredCurrency) {
    if (this.users[email]) {
      return null;
    }
    const id = this.nextId++;
    const user = {
      id,
      name,
      email,
      password_hash: passwordHash,
      preferred_currency: preferredCurrency || 'USD',
      created_at: new Date().toISOString(),
      is_active: true
    };
    this.users[email] = user;
    return user;
  },

  findUserById(id) {
    return Object.values(this.users).find(u => u.id === id) || null;
  }
};
