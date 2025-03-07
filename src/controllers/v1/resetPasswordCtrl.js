const { resetPasswordV1 } = require('../../models/resetPasswordModel');

const resetPasswordV1Ctrl = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    const result = await resetPasswordV1(email, otp, newPassword);
    return res.status(result.status).json({ message: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { resetPasswordV1Ctrl };