const { generateOTP, storeOTP, verifyOTP_v2 } = require("../../utils/otp");
const { sendOTPEmail } = require("../../utils/email");
const db = require('../../db/mysqldb');
const rateLimitCache = new Map();

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
const requestPasswordResetV2 = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const query = "SELECT * FROM users WHERE email = ?";
    const [user] = await db.execute(query, [email]);
    if (user.length === 0) {
      return res.status(200).json({
        message: "If your email is registered, you will receive a password reset OTP",
      });
    }
    const otp = generateOTP();
    storeOTP(email, otp);
    await sendOTPEmail(email, otp);
    return res.status(200).json({ message: "Password reset OTP has been sent to your email" });
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
const resetPasswordV2 = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    const query = "SELECT * FROM users WHERE email = ?";
    const [user] = await db.execute(query, [email]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const cacheKey = `otp_attempts_${email}`;
    const now = Date.now();
    const attempts = rateLimitCache.get(cacheKey) || { count: 0, firstAttemptTime: now };
    
    if (attempts.count >= 5 && now - attempts.firstAttemptTime < 10 * 60 * 1000) {
      return res.status(429).json({
        message: "Too many failed OTP attempts. Please try again after 10 minutes.",
      });
    }
    if (now - attempts.firstAttemptTime > 10 * 60 * 1000) {
      rateLimitCache.delete(cacheKey);
    }

    const verificationResult = verifyOTP_v2(email, otp);
    if (!verificationResult.success) {
      attempts.count++;
      if (attempts.count === 1) {
        attempts.firstAttemptTime = now;
      }
      rateLimitCache.set(cacheKey, attempts);
      return res.status(400).json({ message: verificationResult.message });
    }
    await db.execute("UPDATE users SET password = ? WHERE email = ?", [newPassword, email]);
    rateLimitCache.delete(cacheKey);

    return res.status(200).json({ message: "Password has been reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { requestPasswordResetV2, resetPasswordV2 };
