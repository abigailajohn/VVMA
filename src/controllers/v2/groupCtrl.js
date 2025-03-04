const db = require('../../db/mysqldb');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fetch = require('node-fetch');

function generateInviteCode() {
    return crypto.randomBytes(8).toString('hex').toUpperCase('hex');
}
function createInviteUrl(inviteCode, baseUrl = process.env.BASE_URL) {	
    return `${baseUrl}/join-group/${inviteCode}`;
}

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

const getAllGroups = async (req, res) => {
    try {
        const [groups] = await db.execute(  
            'SELECT id, name, description, max_members, invite_code FROM `groups`'
        ); 
        const groupsWithInviteUrl = groups.map(group => ({
            ...group,
            inviteUrl: group.invite_code ? createInviteUrl(group.invite_code) : null
        }));

        res.json(groupsWithInviteUrl);
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

const getGroupById = async (req, res) => {
    const groupId = req.params.id;
    try {
        const [groups] = await db.execute(
            'SELECT id, name, description, max_members, invite_code FROM `groups` WHERE id = ?', 
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
            inviteUrl: group.invite_code ? createInviteUrl(group.invite_code) : null,
            members: members.map( member => ({ 
                id: member.id, 
                username: member.username, 
                role: member.role
            }))
        };

        res.json(groupWithMembers);
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
const createGroup = async (req, res) => {
    const { name, description, maxMembers } = req.body;
    const creatorId = req.user.userId;

    if (!name || !description || !maxMembers) {
        return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    try {
        const inviteCode = generateInviteCode();
        const [result] = await db.execute(
            'INSERT INTO `groups` (name, description, max_members, creator_id, invite_code) VALUES (?, ?, ?, ?, ?)',
            [name, description, maxMembers, creatorId, inviteCode]
        );
        await db.execute(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
            [result.insertId, creatorId, 'admin']
        );
        const inviteUrl = createInviteUrl(inviteCode);
        res.status(201).json({ 
            id: result.insertId, 
            name, 
            description, 
            maxMembers,
            creatorId,
            inviteCode,
            inviteUrl
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

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
            return res.status(400).json({ error: "You're already in this group" });
        }
        await db.execute(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)', 
            [groupId, userId, 'member']
        );
        
        res.json({ message: 'Successfully joined group' });
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
const joinGroupByInviteUrl = async (req, res) => {
    const userId = req.user.userId;
    const { inviteUrl } = req.body;

    if (!inviteUrl) {
        return res.status(400).json({ error: 'Invite URL is required' });
    }

    try {        
        const response = await fetch(inviteUrl);
        const content = await response.text();

        if (inviteUrl.includes('/join-group/')) {
            const urlParts = inviteUrl.split('/');
            const inviteCode = urlParts[urlParts.length - 1];

            if (!inviteCode) {
                return res.status(400).json({ error: 'Invalid invite URL' });
            }

            const [groups] = await db.execute(
                'SELECT id, max_members FROM `groups` WHERE invite_code = ?',
                [inviteCode]
            );
            if (groups.length === 0) {
                return res.status(404).json({ error: 'Invalid invite code or group not found' });
            }

            const group = groups[0];
            const groupId = group.id;
            const [[memberCount]] = await db.execute(
                'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
                [groupId]
            );
            if (memberCount.count >= group.max_members) {
                return res.status(400).json({ error: 'Group is full, join another' });
            }

            const [[existingMember]] = await db.execute(
                'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
                [groupId, userId]
            );
            if (existingMember) {
                return res.status(400).json({ error: "You're already in this group" });	
            }
            await db.execute(
                'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
                [groupId, userId, 'member']
            );
            return res.json({ message: 'Successfully joined group', groupId });
        }
        return res.json({
            message: content
        });
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
const refreshGroupInvite = async (req, res) => {
    const userId = req.user.userId;
    const groupId = req.params.id;

    try {
        const [admins] = await db.execute(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = ?',
            [groupId, userId, 'admin']
        );
        if (admins.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const newInviteCode = generateInviteCode();
        const [result] = await db.execute(
            'UPDATE `groups` SET invite_code = ? WHERE id = ?',
            [newInviteCode, groupId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }
        const inviteUrl = createInviteUrl(newInviteCode);

        res.json({ 
            message: 'Invite code refreshed', 
            inviteUrl
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    };
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
            return res.status(403).json({ error: 'Not authorized' });
        }
        const [result] = await db.execute(
            'UPDATE `groups` SET name = ?, description = ?, max_members = ? WHERE id = ?',
            [name, description, maxMembers, groupId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json({ message: 'Group updated' });
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

const deleteGroup = async (req, res) => {
    const userId = req.user.userId;
    const groupId = req.params.id;

    try {
        const [groups] = await db.execute(
            'SELECT * FROM `groups` WHERE id = ? AND creator_id = ?',
            [groupId, userId]
        );
        if (groups.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await db.execute('DELETE FROM `groups` WHERE id = ?', [groupId]);

        res.json({ message: 'Group deleted' });
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

const removeGroupMember = async (req, res) => {
    const groupId = req.params.id;
    const memberIdToRemove = req.params.uid;

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
            return res.status(403).json({ error: "You cannot remove the group creator" })
        }
        const [result] = await db.execute(
            'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, memberIdToRemove
        ]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found in the group' });
        }

        res.json({ message: 'User removed from group' });
    } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

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
            return res.status(403).json({ error: 'Not authorized' });
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
        res.json({ message: 'User is now an admin' });
    } catch (err) {
        res.status(500).json({ error: err.message });
      }
};

module.exports = {
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
};