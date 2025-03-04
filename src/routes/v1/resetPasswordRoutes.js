const express = require("express");
const { resetPasswordV1 } = require("../../controllers/v1/resetPasswordCtrl");

const router = express.Router();

router.post("/reset-password/verify", resetPasswordV1);

module.exports = router;