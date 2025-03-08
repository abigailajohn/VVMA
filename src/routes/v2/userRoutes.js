const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const { 
  getMyProfile,
  getUserById,
  updateUser,
  deleteUser 
} = require('../../controllers/v2/userCtrl');

router.get('/me', authMiddleware, getMyProfile);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;