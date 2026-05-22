/** @jest-environment node */

const bcrypt = require('bcryptjs');
const { userStore } = require('../app/api/shared/userStore.js');
const { clearEphemeralResetTokens } = require('../app/api/shared/resetTokenStore.js');
const { POST: forgotPasswordPOST } = require('../app/api/auth/forgot-password/route.js');
const { POST: resetPasswordPOST } = require('../app/api/auth/reset-password/route.js');

function createForgotPasswordRequest(email) {
  return {
    json: jest.fn().mockResolvedValue({ email }),
    nextUrl: { origin: 'https://www.kidzstorymagic.org' },
  };
}

function createResetPasswordRequest(token, password) {
  return {
    json: jest.fn().mockResolvedValue({ token, password }),
  };
}

describe('password reset fallback without persistent auth storage', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    clearEphemeralResetTokens();
    userStore.clear();

    const passwordHash = await bcrypt.hash('OldPass123', 10);
    userStore.addUser('user@example.com', {
      id: 'user_1',
      name: 'Test User',
      email: 'user@example.com',
      passwordHash,
      role: 'customer',
    });
  });

  it('issues reset token and updates shared-store password', async () => {
    const forgotResponse = await forgotPasswordPOST(
      createForgotPasswordRequest('user@example.com')
    );
    const forgotPayload = await forgotResponse.json();

    expect(forgotResponse.status).toBe(200);
    expect(forgotPayload.success).toBe(true);
    expect(forgotPayload.resetUrl).toMatch(/\/auth\/reset-password\?token=/);

    const resetToken = new URL(forgotPayload.resetUrl).searchParams.get('token');
    const resetResponse = await resetPasswordPOST(
      createResetPasswordRequest(resetToken, 'NewPass456')
    );
    const resetPayload = await resetResponse.json();

    expect(resetResponse.status).toBe(200);
    expect(resetPayload.success).toBe(true);

    const updatedUser = userStore.getUser('user@example.com');
    await expect(
      bcrypt.compare('NewPass456', updatedUser.passwordHash)
    ).resolves.toBe(true);
  });

  it('returns 400 for invalid token in shared-store mode', async () => {
    const response = await resetPasswordPOST(
      createResetPasswordRequest('invalid-token', 'NewPass456')
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('Invalid or expired reset token.');
  });
});
