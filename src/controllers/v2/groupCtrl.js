const {
    getAllGroups,
    getGroupById,
    createGroup,
    joinGroup,
    joinGroupByInviteUrl,
    refreshGroupInvite,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    removeGroupMember,
    promoteToAdmin
  } = require('../../models/groupModel');

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Retrieve all groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of all groups
 *       500:
 *         description: Internal server error
 */

const getAllGroupsCtrl = async (req, res) => {
    try {
      const groups = await getAllGroups();
      res.json(groups);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get a group by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The group ID
 *     responses:
 *       200:
 *         description: Retrieved group details
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

const getGroupByIdCtrl = async (req, res) => {
    try {
      const group = await getGroupById(req.params.id);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      res.json(group);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - maxMembers
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               maxMembers:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Group created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
const createGroupCtrl = async (req, res) => {
    try {
      const creatorId = req.user.userId;
      const newGroup = await createGroup({ ...req.body, creatorId });
      res.status(201).json(newGroup);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/{id}/join:
 *   post:
 *     summary: Join a group by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully joined group
 *       400:
 *         description: Group is full
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

const joinGroupCtrl = async (req, res) => {
    try {
      const result = await joinGroup(req.params.id, req.user.userId);
      if (result.error) return res.status(result.status).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/join-by-invite:
 *   post:
 *     summary: Join a group using an invite URL
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteUrl
 *             properties:
 *               inviteUrl:
 *                 type: string
 *                 description: The invite URL for the group
 *     responses:
 *       200:
 *         description: Successfully joined group
 *       400:
 *         description: Invalid invite URL or group is full
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
const joinGroupByInviteUrlCtrl = async (req, res) => {
    try {
      const result = await joinGroupByInviteUrl(req.user.userId, req.body.inviteUrl);
      if (result.error) return res.status(result.status).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/{id}/refresh-invite:
 *   post:
 *     summary: Refresh the invite code for a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: New invite URL generated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
const refreshGroupInviteCtrl = async (req, res) => {
  try {
    const result = await refreshGroupInvite(req.params.id, req.user.userId);
    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * @swagger
 * /api/groups/{id}:
 *   patch:
 *     summary: Update a group by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               maxMembers:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Group updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

const updateGroupCtrl = async (req, res) => {
    try {
      const result = await updateGroup(req.params.id, req.body, req.user.userId);
      if (result.error) return res.status(result.status).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Delete a group by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

const deleteGroupCtrl = async (req, res) => {
    try {
      const result = await deleteGroup(req.params.id, req.user.userId);
      if (result.error) return res.status(result.status).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/{id}/members:
 *   get:
 *     summary: Get members of a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of group members
 *       403:
 *         description: Not authorized to view members
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */

const getGroupMembersCtrl = async (req, res) => {
    try {
      const result = await getGroupMembers(req.params.id, req.user.userId);
      if (result.error) return res.status(result.status).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/{group_id}/members/{user_id}:
 *   delete:
 *     summary: Remove a member from a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User removed
 *       403:
 *         description: Not authorized 
 *       404:
 *         description: Group or user not found
 *       500:
 *         description: Internal server error
 */

const removeGroupMemberCtrl = async (req, res) => {
    try {
      const result = await removeGroupMember(req.params.id, req.params.uid);
      if (result.error) return res.status(result.status).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/{group_id}/promote/{user_id}:
 *   put:
 *     summary: Promote a user to admin
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User promoted to admin
 *       400:
 *         description: Maximum number of admins reached
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Group or user not found
 *       500:
 *         description: Internal server error
 */

const promoteToAdminCtrl = async (req, res) => {
    try {
      const result = await promoteToAdmin(req.params.id, req.params.uid, req.user.userId);
      if (result.error) return res.status(result.status).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  module.exports = {
    getAllGroupsCtrl,
    getGroupByIdCtrl,
    createGroupCtrl,
    joinGroupCtrl,
    joinGroupByInviteUrlCtrl,
    refreshGroupInviteCtrl,
    updateGroupCtrl,
    deleteGroupCtrl,
    getGroupMembersCtrl,
    removeGroupMemberCtrl,
    promoteToAdminCtrl
  };