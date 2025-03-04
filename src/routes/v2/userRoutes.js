const express = require('express');
const { getMyProfile, getUserById, updateUser, deleteUser } = require('../../controllers/v2/userCtrl');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.get('/me', authMiddleware, getMyProfile);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
