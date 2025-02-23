const express = require('express');
const { getUserById, updateUser, deleteUser } = require('../controllers/userCtrl');

const router = express.Router();


router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;