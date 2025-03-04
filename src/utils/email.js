const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025, 
  secure: false,
  auth: null,
  tls: {
    rejectUnauthorized: false,
  },
})

const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: "noreply@example.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset for your account.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; background-color: #f5f5f5; padding: 10px; text-align: center;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    return false
  }
}

module.exports = {
  sendOTPEmail,
}

