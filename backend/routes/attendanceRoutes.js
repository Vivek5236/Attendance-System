const express = require('express');
const router = express.Router();
const {
  punchIn,
  punchOut,
  getTodayAttendance,
  getMyAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All attendance routes require auth

router.post('/punch-in', authorize('employee'), punchIn);
router.put('/punch-out', authorize('employee'), punchOut);
router.get('/today', getTodayAttendance);
router.get('/my', getMyAttendance);
router.get('/all', authorize('manager', 'admin'), getAllAttendance);

module.exports = router;
