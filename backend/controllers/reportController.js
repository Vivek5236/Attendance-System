const Attendance = require('../models/Attendance');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Helper: build attendance query based on role and filters
const buildQuery = async (role, userId, currentUserId, startDate, endDate) => {
  const query = {};

  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  if (role === 'employee') {
    // Employee can only see own records
    query.userId = currentUserId;
  } else if (role === 'manager') {
    // Manager sees only their team
    const teamMembers = await User.find({ managerId: currentUserId }).select('_id');
    const teamIds = teamMembers.map(m => m._id);
    if (userId) {
      // Ensure requested userId is in their team
      const isTeamMember = teamIds.some(id => String(id) === String(userId));
      query.userId = isTeamMember ? userId : { $in: teamIds };
    } else {
      query.userId = { $in: teamIds };
    }
  } else if (role === 'admin') {
    if (userId) query.userId = userId;
  }

  return query;
};

// @desc   Get attendance report data
// @route  GET /api/reports/attendance
// @access Private
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const query = await buildQuery(req.user.role, userId, req.user._id, startDate, endDate);

    const records = await Attendance.find(query)
      .populate('userId', 'name email department')
      .sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Export attendance report as PDF
// @route  GET /api/reports/export/pdf
// @access Private
const exportPDF = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const query = await buildQuery(req.user.role, userId, req.user._id, startDate, endDate);

    const records = await Attendance.find(query)
      .populate('userId', 'name email department')
      .sort({ date: -1 });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.pdf"');
    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text('Attendance Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    if (startDate && endDate) {
      doc.text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
    }
    doc.moveDown();

    // Table headers
    const headers = ['Name', 'Date', 'Punch In', 'Punch Out', 'Hours', 'Status'];
    const colWidths = [100, 70, 70, 70, 50, 70];
    let x = 40;
    const startY = doc.y;

    doc.font('Helvetica-Bold').fontSize(9);
    headers.forEach((h, i) => {
      doc.text(h, x, startY, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font('Helvetica').fontSize(8);
    records.forEach((rec) => {
      if (doc.y > 700) { doc.addPage(); }

      x = 40;
      const rowY = doc.y;
      const name = rec.userId?.name || 'N/A';
      const punchIn = rec.punchInTime ? new Date(rec.punchInTime).toLocaleTimeString() : '-';
      const punchOut = rec.punchOutTime ? new Date(rec.punchOutTime).toLocaleTimeString() : '-';
      const hours = rec.totalWorkingHours ? rec.totalWorkingHours.toFixed(2) + 'h' : '-';
      const statusMap = { completed: 'Completed', incomplete: 'Incomplete', present: 'In Progress' };
      const status = statusMap[rec.status] || rec.status;

      const rowData = [name, rec.date, punchIn, punchOut, hours, status];
      rowData.forEach((val, i) => {
        doc.text(val, x, rowY, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      doc.moveDown(0.8);
    });

    if (records.length === 0) {
      doc.text('No records found for selected filters.', { align: 'center' });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Export attendance report as Excel
// @route  GET /api/reports/export/excel
// @access Private
const exportExcel = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const query = await buildQuery(req.user.role, userId, req.user._id, startDate, endDate);

    const records = await Attendance.find(query)
      .populate('userId', 'name email department')
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Column definitions
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Punch In', key: 'punchIn', width: 15 },
      { header: 'Punch Out', key: 'punchOut', width: 15 },
      { header: 'Working Hours', key: 'hours', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Latitude', key: 'lat', width: 12 },
      { header: 'Longitude', key: 'lng', width: 12 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add rows
    records.forEach(rec => {
      worksheet.addRow({
        name: rec.userId?.name || 'N/A',
        email: rec.userId?.email || 'N/A',
        department: rec.userId?.department || 'N/A',
        date: rec.date,
        punchIn: rec.punchInTime ? new Date(rec.punchInTime).toLocaleTimeString() : '-',
        punchOut: rec.punchOutTime ? new Date(rec.punchOutTime).toLocaleTimeString() : '-',
        hours: rec.totalWorkingHours ? rec.totalWorkingHours.toFixed(2) : '-',
        status: rec.status,
        lat: rec.location?.latitude || '-',
        lng: rec.location?.longitude || '-'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAttendanceReport, exportPDF, exportExcel };
