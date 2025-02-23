const express = require('express');
const { getUserById, updateUser, deleteUser, getUserByUsername } = require('../controllers/userCtrl');

const router = express.Router();

// GET /users/:id - Retrieve user profile (BOLA: leaks full data)
router.get('/:id', getUserById);

// PATCH /users/:id - Update user profile (mass assignment, IDOR)
router.patch('/:id', updateUser);

// DELETE /users/:id - Delete user account (BFLA: no confirmation)
router.delete('/:id', deleteUser);

module.exports = router;