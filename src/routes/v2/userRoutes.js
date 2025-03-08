const express = require('express');
const router = express.Router();
const { 
  getMyProfile,
  getUserById,
  updateUser,
  deleteUser 
} = require('../../controllers/v2/userCtrl');

const authMiddleware = require('../../middleware/auth');

router.get('/me', authMiddleware, getMyProfile);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;