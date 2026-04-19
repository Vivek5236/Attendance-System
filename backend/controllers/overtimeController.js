const Overtime = require('../models/Overtime');
const Attendance = require('../models/Attendance');
const { getTodayDate } = require('../utils/dateHelper');

// @desc   Request overtime
// @route  POST /api/overtime/request
// @access Private (Employee)
const requestOvertime = async (req, res) => {
  try {
    const { attendanceId, requestedHours, reason } = req.body;

    if (!attendanceId || !requestedHours || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if attendance record belongs to this user
    const attendance = await Attendance.findOne({ _id: attendanceId, userId: req.user._id });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    // Check if OT already requested for this day
    const existingOT = await Overtime.findOne({ attendanceId, userId: req.user._id });
    if (existingOT) {
      return res.status(400).json({ success: false, message: 'Overtime already requested for this day' });
    }

    const overtime = await Overtime.create({
      userId: req.user._id,
      attendanceId,
      date: attendance.date,
      requestedHours,
      reason
    });

    res.status(201).json({ success: true, message: 'Overtime request submitted', data: overtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my overtime requests
// @route  GET /api/overtime/my
// @access Private (Employee)
const getMyOvertime = async (req, res) => {
  try {
    const overtime = await Overtime.find({ userId: req.user._id })
      .populate('attendanceId', 'date punchInTime punchOutTime totalWorkingHours')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: overtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all pending overtime requests (Manager/Admin)
// @route  GET /api/overtime/pending
// @access Private (Manager/Admin)
const getPendingOvertime = async (req, res) => {
  try {
    const query = { status: 'pending' };

    // Manager sees only their team's OT requests
    if (req.user.role === 'manager') {
      const User = require('../models/User');
      const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
      const teamIds = teamMembers.map(m => m._id);
      query.userId = { $in: teamIds };
    }

    const overtime = await Overtime.find(query)
      .populate('userId', 'name email department')
      .populate('attendanceId', 'date punchInTime punchOutTime totalWorkingHours')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: overtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   All overtime requests (Manager/Admin)
// @route  GET /api/overtime/all
// @access Private (Manager/Admin)
const getAllOvertime = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'manager') {
      const User = require('../models/User');
      const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
      const teamIds = teamMembers.map(m => m._id);
      query.userId = { $in: teamIds };
    }

    const overtime = await Overtime.find(query)
      .populate('userId', 'name email department')
      .populate('attendanceId', 'date punchInTime punchOutTime totalWorkingHours')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: overtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Approve or Reject overtime
// @route  PUT /api/overtime/:id/review
// @access Private (Manager/Admin)
const reviewOvertime = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const overtime = await Overtime.findById(req.params.id);
    if (!overtime) {
      return res.status(404).json({ success: false, message: 'Overtime request not found' });
    }

    if (overtime.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already reviewed' });
    }

    // Manager can only review their team's requests
    if (req.user.role === 'manager') {
      const User = require('../models/User');
      const employee = await User.findById(overtime.userId);
      if (!employee || String(employee.managerId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to review this request' });
      }
    }

    overtime.status = status;
    overtime.reviewedBy = req.user._id;
    overtime.reviewNote = reviewNote || '';
    overtime.reviewedAt = new Date();
    await overtime.save();

    res.json({
      success: true,
      message: `Overtime ${status} successfully`,
      data: overtime
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { requestOvertime, getMyOvertime, getPendingOvertime, getAllOvertime, reviewOvertime };
