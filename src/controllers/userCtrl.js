const { getUserById, updateUser, deleteUser, requestPasswordReset, validateResetPassword } = require('../models/userModel');

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a user profile by ID
 *     description: Returns the full user object for the specified user ID. Vulnerable to SQL injection and excessive data exposure.
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

const getUserByIdCtrl = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user profile
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
 *         description: User updated successfully.
 *       500:
 *         description: Internal server error.
 */

const updateUserCtrl = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
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
 *     summary: Delete a user account
 *     description: >
 *       Deletes the user account specified by the ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user to delete.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 affectedRows:
 *                   type: integer
 *       403:
 *         description: Not authorized to delete this user.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
const deleteUserCtrl = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.userId !== Number(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this user' });
    }
    const affectedRows = await deleteUser(req.params.id);
    if (typeof affectedRows === "object" && affectedRows.error) {
      return res.status(affectedRows.status).json({ error: affectedRows.error });
    }
    res.json({ message: 'User deleted successfully', affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Request password reset
 *     description: Generates a JWT for password reset. Vulnerable due to weak secret, excessive data exposure, and lack of rate limiting.
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *     responses:
 *       200:
 *         description: Password reset token generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error.
 */

const requestPasswordResetCtrl = async (req, res) => {
  try {
    const token = await requestPasswordReset(req.body.email);
    res.json({ message: 'Password reset token generated', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/reset-password:
 *   get:
 *     summary: Validate/reset password link
 *     description: Verifies the JWT provided in the query string. Vulnerable due to weak secret and excessive data exposure.
 *     tags:
 *       - Password Reset
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The JWT token to validate.
 *     responses:
 *       200:
 *         description: Token is valid. Returns the decoded payload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid or expired token.
 *       500:
 *         description: Internal server error.
 */

const validateResetPasswordCtrl = async (req, res) => {
  try {
    const decoded = await validateResetPassword(req.query.token);
    res.json({ message: 'Token is valid. Proceed to reset password.', decoded });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token', details: err.message });
  }
};

module.exports = {
  getUserByIdCtrl,
  updateUserCtrl,
  deleteUserCtrl,
  requestPasswordResetCtrl,
  validateResetPasswordCtrl
};