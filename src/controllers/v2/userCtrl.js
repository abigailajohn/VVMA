const { 
  getMyProfileModel, 
  getUserByIdModel, 
  updateUserModel, 
  deleteUserModel 
} = require('../../models/userModel');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the profile of the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 bio:
 *                   type: string
 *       401:
 *         description: Not authenticated or invalid token
 *       500:
 *         description: Internal server error
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await getMyProfileModel(userId);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user.
 *     responses:
 *       200:
 *         description: A user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdModel(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     description: Updates specific user fields (username, email, and bio) 
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The fields to update. Only "username", "email", and "bio" are allowed.
 *     responses:
 *       200:
 *         description: User updated.
 *       500:
 *         description: Internal server error.
 */
const updateUser = async (req, res) => {
  try {
    const user = await updateUserModel(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete.
 *     responses:
 *       200:
 *         description: User deleted.
 *       500:
 *         description: Internal server error.
 */
const deleteUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.userId !== Number(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this user' });
    }
    const affectedRows = await deleteUserModel(req.params.id);
    if (typeof affectedRows === "object" && affectedRows.error) {
      return res.status(affectedRows.status).json({ error: affectedRows.error });
    }
    res.json({ message: 'User deleted successfully', affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMyProfile,
  getUserById,
  updateUser,
  deleteUser
};