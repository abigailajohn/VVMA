const express = require('express');
const { requestPasswordResetV2Ctrl, resetPasswordV2Ctrl } = require("../../controllers/v2/resetPasswordCtrl");

const router = express.Router();

router.post('/reset-password', requestPasswordResetV2Ctrl);
router.post('/reset-password/verify', resetPasswordV2Ctrl);

module.exports = router;