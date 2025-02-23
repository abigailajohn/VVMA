const db = require('../db/mysqldb');
const jwt = require('jsonwebtoken');

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

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM users WHERE id = '" + id + "'";
    const [users] = await db.execute(query);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user profile
 *     description: Updates user fields using data from the request body. Vulnerable to mass assignment and SQL injection.
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
 *             description: The fields to update. Any field may be updated without validation.
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       500:
 *         description: Internal server error.
 */

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let setClause = '';
    for (let key in updates) {
      setClause += `${key} = '${updates[key]}', `;
    }
    setClause = setClause.slice(0, -2);
    const query = `UPDATE users SET ${setClause} WHERE id = '${id}'`;
    const [result] = await db.execute(query);
    res.json({
      message: 'User updated',
      affectedRows: result.affectedRows,
      updatedFields: updates,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user account
 *     description: Deletes the user account by ID without proper authorization checks. Vulnerable to broken function level authorization.
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
 *         description: User deleted successfully.
 *       500:
 *         description: Internal server error.
 */

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM users WHERE id = '" + id + "'";
    const [result] = await db.execute(query);
    res.json({
      message: 'User deleted',
    });
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

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const token = jwt.sign(
      {
        email, 
        role: "user",
        reset: true,
        resetRequestedAt: new Date().toISOString()
      },
      'secret',
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Password reset token generated',
      token
    });
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

const validateResetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid or expired token', details: err.message });
      }
      res.json({
        message: 'Token is valid. Proceed to reset password.',
        decoded
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
  requestPasswordReset,
  validateResetPassword,
};