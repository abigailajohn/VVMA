const express = require('express');
const authRoutes = require('./v2/auth'); 
const userRoutes = require('./v2/userRoutes');    
const resetPasswordV1 = require('./v1/resetPasswordRoutes');
const resetPasswordRoutesV2 = require('./v2/resetPasswordRoutes');
const groupRoutes = require('./v2/group');

const router = express.Router();

router.use('/auth', authRoutes); 
router.use('/users', userRoutes);   
router.use('/groups', groupRoutes);

router.use('/v2/auth', resetPasswordRoutesV2);
router.use('/v1/auth', resetPasswordV1);  

module.exports = router;