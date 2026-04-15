const {
  sendResponse,
  getPaginationParams,
  validateFileUpload,
  generateRandomString,
  formatPrice,
} = require('./helpers');

describe('Helper utilities', () => {
  describe('sendResponse', () => {
    it('should send a successful response', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      sendResponse(res, 200, true, 'Success', { id: 1 });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { id: 1 },
      });
    });
  });

  describe('getPaginationParams', () => {
    it('should return default pagination params', () => {
      const params = getPaginationParams();
      expect(params).toEqual({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should return custom pagination params', () => {
      const params = getPaginationParams(2, 20);
      expect(params).toEqual({
        page: 2,
        limit: 20,
        offset: 20,
      });
    });

    it('should limit max page size to 100', () => {
      const params = getPaginationParams(1, 200);
      expect(params.limit).toBe(100);
    });
  });

  describe('validateFileUpload', () => {
    it('should validate correct file', () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
      };
      const result = validateFileUpload(file, ['image/jpeg'], 5 * 1024 * 1024);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid file type', () => {
      const file = {
        mimetype: 'text/plain',
        size: 1024,
      };
      const result = validateFileUpload(file, ['image/jpeg']);
      expect(result.valid).toBe(false);
    });

    it('should reject oversized file', () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024,
      };
      const result = validateFileUpload(file, ['image/jpeg'], 5 * 1024 * 1024);
      expect(result.valid).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('should generate random string of correct length', () => {
      const str = generateRandomString(20);
      expect(str).toHaveLength(20);
    });

    it('should generate different strings', () => {
      const str1 = generateRandomString();
      const str2 = generateRandomString();
      expect(str1).not.toBe(str2);
    });
  });

  describe('formatPrice', () => {
    it('should format USD price', () => {
      const formatted = formatPrice(19.99, 'USD');
      expect(formatted).toBe('$19.99 USD');
    });

    it('should format EUR price', () => {
      const formatted = formatPrice(15.5, 'EUR');
      expect(formatted).toBe('€15.50 EUR');
    });
  });
});
