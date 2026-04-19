const User = require('../models/User');

// @desc   Get all users (Admin)
// @route  GET /api/users
// @access Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get team members (Manager)
// @route  GET /api/users/team
// @access Private (Manager)
const getTeamMembers = async (req, res) => {
  try {
    const team = await User.find({ managerId: req.user._id }).select('-password');
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all managers (for assigning)
// @route  GET /api/users/managers
// @access Private (Admin)
const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('name email department');
    res.json({ success: true, data: managers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update user (Admin)
// @route  PUT /api/users/:id
// @access Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { name, department, role, managerId, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, department, role, managerId, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getTeamMembers, getManagers, updateUser };
