const express = require('express');
const { resetPasswordV2, requestPasswordResetV2 } = require('../../controllers/v2/resetPasswordCtrl');

const router = express.Router();

router.post('/reset-password', requestPasswordResetV2);
router.post('/reset-password/verify', resetPasswordV2);

module.exports = router;