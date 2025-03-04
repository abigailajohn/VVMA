const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }
  
  const otpStore = new Map()
  const otpAttempts = new Map()

  const storeOTP = (email, otp) => {
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    })
  
    otpAttempts.set(email, 0)
  }
  
  const verifyOTP_v1 = (email, otp) => {
    const storedData = otpStore.get(email)

    if (!storedData) {
      return false 
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email) 
      return false
    }

    if (storedData.otp === otp) {
      otpStore.delete(email)
      return true
    }
    return false
  }
  
  const verifyOTP_v2 = (email, otp) => {
    const storedData = otpStore.get(email) 

    if (!storedData) {
      return { success: false, message: "No OTP found for this email" }
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email)
      return { success: false, message: "OTP has expired" }
    }
  
    const attempts = otpAttempts.get(email) || 0
  
    if (attempts >= 5) {
      return { success: false, message: "Too many failed attempts. Request a new OTP." }
    }

    otpAttempts.set(email, attempts + 1)

    if (storedData.otp === otp) {
      otpStore.delete(email) 
      otpAttempts.delete(email) 
      return { success: true, message: "OTP verified" }
    }
  
    return { success: false, message: "Invalid OTP" }
  }
  
  module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP_v1,
    verifyOTP_v2,
  }
  
  