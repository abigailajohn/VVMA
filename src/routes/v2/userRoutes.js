const express = require('express');
const router = express.Router();
const { 
  getMyProfile,
  getUserById,
  updateUser,
  deleteUser 
} = require('../../controllers/v2/userCtrl');

router.get('/me', getMyProfile);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;