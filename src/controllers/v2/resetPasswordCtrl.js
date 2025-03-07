const { requestPasswordResetV2, resetPasswordV2 } = require('../../models/resetPasswordModel');


// POST /api/v2/auth/reset-password
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

 //POST /api/v2/auth/reset-password/verify
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