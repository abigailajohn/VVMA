const db = require('../../db/mysqldb');
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
    
    const userQuery = "SELECT id, username, email, role, bio, created_at FROM users WHERE id = ?";
    const [users] = await db.execute(userQuery, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    const groupsQuery = `
      SELECT \`g\`.id, \`g\`.name, gm.role
      FROM \`groups\` \`g\`
      JOIN group_members gm ON \`g\`.id = gm.group_id
      WHERE gm.user_id = ?
    `;
    const [groups] = await db.execute(groupsQuery, [userId]);

    res.json({
      ...user,
      groups
    });
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
    const { id } = req.params;
    const userQuery = "SELECT id, username, email, role, bio, created_at FROM users WHERE id = ?";
    const [users] = await db.execute(userQuery, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    const groupsQuery = `
      SELECT \`g\`.id, \`g\`.name, gm.role
      FROM \`groups\` \`g\`
      JOIN group_members gm ON \`g\`.id = gm.group_id
      WHERE gm.user_id = ?
    `;
    const [groups] = await db.execute(groupsQuery, [id]);
    res.json({
      ...user,
      groups
    });
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
 *             description: The fields to update.
 *     responses:
 *       200:
 *         description: User updated.
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
    const { id } = req.params;
    const query = "DELETE FROM users WHERE id = ?";
    const [result] = await db.execute(query, [id]);
    res.json({
      message: 'User deleted',
    });
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