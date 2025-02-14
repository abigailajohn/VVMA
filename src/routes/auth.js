//all auth related endpoints 
const express = require('express');
const { registerUser } = require('../controllers/authCtrl');

const router = express.Router();

router.post('/register', registerUser);

module.exports = router;