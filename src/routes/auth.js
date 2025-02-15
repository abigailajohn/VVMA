//all auth related endpoints 
const express = require('express');
const { registerUser, loginUser  } = require('../controllers/authCtrl');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;