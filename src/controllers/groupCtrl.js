const {
    getAllGroups,
    getGroupById,
    createGroup,
    joinGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    removeGroupMember,
    promoteToAdmin
  } = require('../models/groupModel');

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
 *         description: Server error
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
 *     summary: Get a specific group by ID
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
 *         description: Group details retrieved successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
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
 *         description: Group created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

const createGroupCtrl = async (req, res) => {
    try {
      const creatorId = req.user ? req.user.userId : 1;
      const groupId = await createGroup({ ...req.body, creatorId });
      res.status(201).json({ message: 'Group created successfully', id: groupId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };  

/**
 * @swagger
 * /api/groups/{id}/join:
 *   post:
 *     summary: Join a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully joined the group
 *       400:
 *         description: Group is full
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
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
 * /api/groups/{id}:
 *   patch:
 *     summary: Update group details (admin only)
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
 *         description: Group updated successfully
 *       403:
 *         description: Not authorized to update this group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */

const updateGroupCtrl = async (req, res) => {
  try {
    const group = await updateGroup(req.params.id, req.body);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json({ message: 'Group updated successfully', group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Delete a group (only by group creator)
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       403:
 *         description: Not authorized to delete this group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
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
 *     summary: List all members of a group (only for group members)
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
 *         description: Server error
 */

const getGroupMembersCtrl = async (req, res) => {
    try {
      const members = await getGroupMembers(req.params.id, req.user.userId);
      if (members.error) return res.status(members.status).json({ error: members.error });
      res.json(members);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

/**
 * @swagger
 * /api/groups/{id}/members/{uid}:
 *   delete:
 *     summary: Remove a user from a group (admin only)
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
 *         description: User removed from group successfully
 *       403:
 *         description: Not authorized to remove members
 *       404:
 *         description: Group or user not found
 *       500:
 *         description: Server error
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
 * /api/groups/{id}/promote/{uid}:
 *   put:
 *     summary: Promote a user to admin (group admin only)
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
 *         description: User promoted to admin successfully
 *       400:
 *         description: Maximum number of admins reached
 *       403:
 *         description: Not authorized to promote members
 *       404:
 *         description: Group or user not found
 *       500:
 *         description: Server error
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
    updateGroupCtrl,
    deleteGroupCtrl,
    getGroupMembersCtrl,
    removeGroupMemberCtrl,
    promoteToAdminCtrl
  };  