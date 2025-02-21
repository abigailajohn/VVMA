const express = require('express');
const { body } = require('express-validator');
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

router.get('/', getAllGroups);
router.get('/:id', getGroupById);
router.post('/', createGroupValidation, createGroup);
router.post('/:id/join', joinGroup);
router.patch('/:id', updateGroupValidation, updateGroup);
router.delete('/:id', deleteGroup);
router.get('/:id/members', getGroupMembers);
router.delete('/:id/members/:uid', removeGroupMember);
router.put('/:id/promote/:uid', promoteToAdmin);


module.exports = router;