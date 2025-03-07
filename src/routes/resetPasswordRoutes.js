const express = require('express');
const { requestPasswordResetCtrl, validateResetPasswordCtrl } = require('../controllers/userCtrl');

const router = express.Router();

router.post('/reset-password', requestPasswordResetCtrl);
router.get('/reset-password', validateResetPasswordCtrl);

module.exports = router;