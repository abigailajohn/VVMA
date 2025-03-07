const express = require('express');
const { getUserByIdCtrl, updateUserCtrl, deleteUserCtrl } = require('../controllers/userCtrl');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/:id', getUserByIdCtrl);
router.patch('/:id', authMiddleware, updateUserCtrl);
router.delete('/:id', authMiddleware, deleteUserCtrl);

module.exports = router;