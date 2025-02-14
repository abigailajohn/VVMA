//gathers all routes
const express = require('express');
const authRoutes = require('./auth'); 

const router = express.Router();

router.use('/auth', authRoutes); 

module.exports = router;