const db = require('../db/mysqldb');

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

const getAllGroups = async (req, res) => {
    try {
        const [groups] = await db.execute(
            'SELECT id, name, description, max_members FROM `groups`'
        );

        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups', error);
        res.status(500).json({ error: 'Internal server error' });
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

const getGroupById = async (req, res) => {
    const groupId = req.params.id;

    try {
        const [groups] = await db.execute(
            'SELECT id, name, description, max_members FROM `groups` WHERE id = ?', 
            [groupId]
        );

        if (groups.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const group = groups[0];

        const [members] = await db.execute(
            'SELECT u.username, gm.role FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = ?',
            [groupId]
        );

        const groupWithMembers = {
            ...group,
            members: members.map( member => ({ 
                id: member.id, 
                username: member.username, 
                role: member.role
            }))
        };

        res.json(groupWithMembers);
    } catch (error) {
        console.error('Error fetching group details:', error);
        res.status(500).json({ error: 'Internal server error' });
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

const createGroup = async (req, res) => {
    const { name, description, maxMembers } = req.body;
    const creatorId = req.user.userId;
    
    if (!name || !description || !maxMembers) {
        return res.status(400).json({ error: 'Name, description, and maxMembers are required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO `groups` (name, description, max_members, creator_id) VALUES (?, ?, ?, ?)',
            [name, description, maxMembers, creatorId]
        );

        // Add creator as admin
        await db.execute(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
            [result.insertId, creatorId, 'admin']
        );

        res.status(201).json({ 
            id: result.insertId, 
            name, 
            description, 
            maxMembers,
            creatorId
        });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Internal server error' });
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

const joinGroup = async (req, res) => {
    const userId = req.user.userId;
    const groupId = req.params.id;

    try {
        const [[group]] = await db.execute(
            'SELECT max_members FROM `groups` WHERE id = ?', 
            [groupId]
        );

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const [[memberCount]] = await db.execute(
            'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?', 
            [groupId]
        );

        if (memberCount.count >= group.max_members) {
            return res.status(400).json({ error: 'Group is full, join another.' });
        }

        const [[existingMember]] = await db.execute(
            'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        if (existingMember) {
            return res.status(400).json({ error: 'You are already a member of this group' });
        }

        await db.execute(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)', 
            [groupId, userId, 'member']
        );

        res.json({ message: 'Successfully joined the group' });
    } catch (error) {
        console.error('Error joining group', error);
        res.status(500).json({ error: 'Internal server error' });
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

const updateGroup = async (req, res) => {
    const userId = req.user.userId;
    const groupId = req.params.id;
    const { name, description, maxMembers } = req.body;

    try {
        const [admins] = await db.execute(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = ?',
            [groupId, userId, 'admin']
        );

        if (admins.length === 0) {
            return res.status(403).json({ error: 'Not authorized to update this group' });
        }

        const [result] = await db.execute(
            'UPDATE `groups` SET name = ?, description = ?, max_members = ? WHERE id = ?',
            [name, description, maxMembers, groupId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json({ message: 'Group updated successfully' });
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Internal server error' });
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

const deleteGroup = async (req, res) => {
    const userId = req.user.userId;
    const groupId = req.params.id;

    try {
        const [groups] = await db.execute(
            'SELECT * FROM `groups` WHERE id = ? AND creator_id = ?',
            [groupId, userId]
        );

        if (groups.length === 0) {
            return res.status(403).json({ error: 'Not authorized to delete this group' });
        }

        await db.execute('DELETE FROM `groups` WHERE id = ?', [groupId]);
        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Internal server error' });
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

const getGroupMembers = async (req, res) => {
    const userId = req.user.userId;
    const groupId = req.params.id;
 
    try {
        const [membership] = await db.execute(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );

        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not authorized to view members' });
        }

        const [members] = await db.execute(
            'SELECT u.id, u.username, gm.role FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = ?',
            [groupId]
        );

        res.json(members);
    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).json({ error: 'Internal server error' });
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

const removeGroupMember = async (req, res) => {
    const groupId = req.params.id;
    const memberIdToRemove = req.params.uid;
    const requestingUserId = req.user.userId;

    try {
        const [groups] = await db.execute(
            'SELECT creator_id FROM `groups` WHERE id = ?',
            [groupId]
        );

        if (groups.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const group = groups[0];

        if (String(memberIdToRemove) === String(group.creator_id)) {
            return res.status(403).json({ error: "Cannot remove the group creator" })
        }

        const [result] = await db.execute(
            'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, memberIdToRemove
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found in the group' });
        }

        res.json({ message: 'User removed from group successfully' });
    } catch (error) {
        console.error('Error removing group member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

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

const promoteToAdmin = async (req, res) => {
    const groupId = req.params.id;
    const userIdToPromote = req.params.uid;
    const adminId = req.user.userId;

    try {
        const [admins] = await db.execute(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = ?',
            [groupId, adminId, 'admin']
        );

        if (admins.length === 0) {
            return res.status(403).json({ error: 'Not authorized to promote members' });
        }

        const [adminCount] = await db.execute(
            'SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND role = ?',
            [groupId, 'admin']
        );

        if (adminCount[0].count >= 3) {
            return res.status(400).json({ error: 'Maximum number of admins reached' });
        }

        const [result] = await db.execute(
            'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
            ['admin', groupId, userIdToPromote]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found in group' });
        }

        res.json({ message: 'User promoted to admin successfully' });
    } catch (error) {
        console.error('Error promoting to admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllGroups,
    getGroupById,
    createGroup,
    joinGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    removeGroupMember,
    promoteToAdmin
};