import { shouldRedirectToLoginOnUnauthorized } from '@/utils/api';

describe('shouldRedirectToLoginOnUnauthorized', () => {
  it('returns false for non-401 responses', () => {
    expect(
      shouldRedirectToLoginOnUnauthorized({
        response: { status: 500 },
        config: { url: '/auth/login' },
      })
    ).toBe(false);
  });

  it('returns false for login endpoint 401 errors so UI can show invalid credentials', () => {
    expect(
      shouldRedirectToLoginOnUnauthorized({
        response: { status: 401 },
        config: { url: '/auth/login' },
      })
    ).toBe(false);

    expect(
      shouldRedirectToLoginOnUnauthorized({
        response: { status: 401 },
        config: { url: '/api/auth/login' },
      })
    ).toBe(false);
  });

  it('returns true for protected endpoint 401 errors', () => {
    expect(
      shouldRedirectToLoginOnUnauthorized({
        response: { status: 401 },
        config: { url: '/story/create' },
      })
    ).toBe(true);
  });
});
