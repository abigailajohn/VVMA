const express = require('express');
const { body } = require('express-validator');
const {
        getAllGroupsCtrl,
        getGroupByIdCtrl,
        createGroupCtrl,
        joinGroupCtrl,
        updateGroupCtrl,
        deleteGroupCtrl,
        getGroupMembersCtrl,
        removeGroupMemberCtrl,
        promoteToAdminCtrl
} = require('../controllers/groupCtrl');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation middleware
const createGroupValidation = [
    body('name').notEmpty().withMessage('Group name is required'),
    body('description').notEmpty().withMessage('Group description is required'),
    body('maxMembers').isInt({ min: 2 }).withMessage('Max members must be at least 2')
];

const updateGroupValidation = [
    body('name').optional().notEmpty().withMessage('Group name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Group description cannot be empty'),
    body('maxMembers').optional().isInt({ min: 2 }).withMessage('Max members must be at least 2')
];

router.get('/', getAllGroupsCtrl);
router.get('/:id', getGroupByIdCtrl);
router.post('/', createGroupValidation, createGroupCtrl);
router.post('/:id/join', joinGroupCtrl);
router.patch('/:id', updateGroupValidation, updateGroupCtrl);
router.delete('/:id', deleteGroupCtrl);
router.get('/:id/members', getGroupMembersCtrl);
router.delete('/:id/members/:uid', removeGroupMemberCtrl);
router.put('/:id/promote/:uid', promoteToAdminCtrl);

module.exports = router;