const express = require('express');
const { requestPasswordReset, validateResetPassword } = require('../controllers/userCtrl');

const router = express.Router();

router.post('/reset-password', requestPasswordReset);
router.get('/reset-password', validateResetPassword);

module.exports = router;