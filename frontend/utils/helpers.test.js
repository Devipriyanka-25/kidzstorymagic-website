import {
  formatCurrency,
  validateEmail,
  validatePassword,
  getPasswordStrength,
} from '@/utils/helpers';

describe('Frontend helpers', () => {
  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      const formatted = formatCurrency(19.99, 'USD');
      expect(formatted).toBe('$19.99');
    });

    it('should format CAD currency', () => {
      const formatted = formatCurrency(25.5, 'CAD');
      expect(formatted).toBe('C$25.50');
    });

    it('should format EUR currency', () => {
      const formatted = formatCurrency(15, 'EUR');
      expect(formatted).toBe('€15.00');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      expect(validatePassword('StrongPass123')).toBe(true);
    });

    it('should reject password without uppercase', () => {
      expect(validatePassword('weakpass123')).toBe(false);
    });

    it('should reject password without number', () => {
      expect(validatePassword('StrongPass')).toBe(false);
    });

    it('should reject password less than 8 characters', () => {
      expect(validatePassword('Weak1')).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    it('should rate weak password', () => {
      const strength = getPasswordStrength('weak');
      expect(strength.score).toBe(0);
      expect(strength.label).toBe('Weak');
    });

    it('should rate strong password', () => {
      const strength = getPasswordStrength('StrongPass123!');
      expect(strength.score).toBeGreaterThan(3);
      expect(['Strong', 'Very Strong']).toContain(strength.label);
    });
  });
});
