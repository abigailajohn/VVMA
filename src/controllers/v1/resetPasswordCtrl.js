const db = require('../../db/mysqldb');
const { verifyOTP_v1 } = require("../../utils/otp");

const resetPasswordV1 = async (req, res) => {
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
    const isOTPValid = verifyOTP_v1(email, otp);
    if (!isOTPValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    await db.execute("UPDATE users SET password = ? WHERE email = ?", [newPassword, email]);
    
    return res.status(200).json({ message: "Password has been reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { resetPasswordV1 };
