const { requestPasswordResetV2, resetPasswordV2 } = require('../../models/resetPasswordModel');

/**
 * @swagger
 * /api/v2/auth/reset-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP successfully sent
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
const requestPasswordResetV2Ctrl = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const result = await requestPasswordResetV2(email);
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/v2/auth/reset-password/verify:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid OTP or email
 *       500:
 *         description: Internal server error
 */
const resetPasswordV2Ctrl = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    const result = await resetPasswordV2(email, otp, newPassword);
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  requestPasswordResetV2Ctrl,
  resetPasswordV2Ctrl,
};