const express = require("express");
const { resetPasswordV1Ctrl } = require("../../controllers/v1/resetPasswordCtrl");

const router = express.Router();

router.post("/reset-password/verify", resetPasswordV1Ctrl);

module.exports = router;