const express = require('express');
const router = express.Router();
const { getAllUsers, getTeamMembers, getManagers, updateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin'), getAllUsers);
router.get('/team', authorize('manager'), getTeamMembers);
router.get('/managers', authorize('admin'), getManagers);
router.put('/:id', authorize('admin'), updateUser);

module.exports = router;
