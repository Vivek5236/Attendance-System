const express = require('express');
const router = express.Router();
const { getAttendanceReport, exportPDF, exportExcel } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/attendance', getAttendanceReport);
router.get('/export/pdf', exportPDF);
router.get('/export/excel', exportExcel);

module.exports = router;
