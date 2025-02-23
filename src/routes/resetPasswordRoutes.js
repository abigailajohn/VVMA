const express = require('express');
const { requestPasswordReset, validateResetPassword } = require('../controllers/userCtrl');

const router = express.Router();

// POST /reset-password - Request password reset
router.post('/reset-password', requestPasswordReset);

// GET /reset-password - Validate or reset password link
router.get('/reset-password', validateResetPassword);

module.exports = router;