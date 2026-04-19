const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Store as YYYY-MM-DD for easy filtering
    required: true
  },
  punchInTime: {
    type: Date,
    required: true
  },
  punchOutTime: {
    type: Date,
    default: null
  },
  selfie: {
    type: String, // base64 encoded image string
    default: null
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: '' }
  },
  totalWorkingHours: {
    type: Number, // in hours, calculated on punch out
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'incomplete', 'completed'],
    default: 'present'
  }
}, { timestamps: true });

// One attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total working hours on punch out
attendanceSchema.methods.calculateHours = function () {
  if (this.punchInTime && this.punchOutTime) {
    const diff = this.punchOutTime - this.punchInTime;
    this.totalWorkingHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
    // Determine status based on 8-hour standard
    this.status = this.totalWorkingHours >= 8 ? 'completed' : 'incomplete';
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);
