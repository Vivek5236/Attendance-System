const Attendance = require('../models/Attendance');
const { getTodayDate } = require('../utils/dateHelper');

// @desc   Punch In
// @route  POST /api/attendance/punch-in
// @access Private (Employee)
const punchIn = async (req, res) => {
  try {
    const { selfie, latitude, longitude } = req.body;
    const today = getTodayDate();

    // Check if already punched in today
    const existing = await Attendance.findOne({ userId: req.user._id, date: today });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already punched in today' });
    }

    if (!selfie) {
      return res.status(400).json({ success: false, message: 'Selfie is required for punch in' });
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      date: today,
      punchInTime: new Date(),
      selfie,
      location: {
        latitude: latitude || null,
        longitude: longitude || null
      },
      status: 'present'
    });

    res.status(201).json({
      success: true,
      message: 'Punched in successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Punch Out
// @route  PUT /api/attendance/punch-out
// @access Private (Employee)
const punchOut = async (req, res) => {
  try {
    const today = getTodayDate();

    const attendance = await Attendance.findOne({ userId: req.user._id, date: today });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No punch-in record found for today' });
    }

    if (attendance.punchOutTime) {
      return res.status(400).json({ success: false, message: 'Already punched out today' });
    }

    attendance.punchOutTime = new Date();
    attendance.calculateHours(); // Calculate total hours and set status
    await attendance.save();

    res.json({
      success: true,
      message: 'Punched out successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get today's attendance status for logged-in employee
// @route  GET /api/attendance/today
// @access Private
const getTodayAttendance = async (req, res) => {
  try {
    const today = getTodayDate();
    const attendance = await Attendance.findOne({ userId: req.user._id, date: today });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get attendance for logged-in employee
// @route  GET /api/attendance/my
// @access Private (Employee)
const getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const total = await Attendance.countDocuments(query);
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: attendance, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all attendance (Admin) or team attendance (Manager)
// @route  GET /api/attendance/all
// @access Private (Admin/Manager)
const getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, userId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (userId) {
      query.userId = userId;
    }

    // Manager can only see their team's attendance
    if (req.user.role === 'manager') {
      const User = require('../models/User');
      const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
      const teamIds = teamMembers.map(m => m._id);
      query.userId = userId ? userId : { $in: teamIds };
    }

    const total = await Attendance.countDocuments(query);
    const attendance = await Attendance.find(query)
      .populate('userId', 'name email department')
      .sort({ date: -1, punchInTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: attendance, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { punchIn, punchOut, getTodayAttendance, getMyAttendance, getAllAttendance };
