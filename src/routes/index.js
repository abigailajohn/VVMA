//gathers all routes
const express = require('express');
const authRoutes = require('./auth'); 
const userRoutes = require('./userRoutes');    
const resetPasswordRoutes = require('./resetPasswordRoutes'); 
const groupRoutes = require('./group');

const router = express.Router();

router.use('/auth', authRoutes); 
router.use('/users', userRoutes);   
router.use('/', resetPasswordRoutes);   
router.use('/groups', groupRoutes);

module.exports = router;