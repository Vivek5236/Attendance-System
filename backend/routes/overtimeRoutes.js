const express = require('express');
const router = express.Router();
const {
  requestOvertime,
  getMyOvertime,
  getPendingOvertime,
  getAllOvertime,
  reviewOvertime
} = require('../controllers/overtimeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/request', authorize('employee'), requestOvertime);
router.get('/my', authorize('employee'), getMyOvertime);
router.get('/pending', authorize('manager', 'admin'), getPendingOvertime);
router.get('/all', authorize('manager', 'admin'), getAllOvertime);
router.put('/:id/review', authorize('manager', 'admin'), reviewOvertime);

module.exports = router;
