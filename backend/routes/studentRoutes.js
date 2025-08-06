const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const {
  getDashboardStats,
  getTotalStudents,
  getTotalFeesCollected,
  getPendingFees,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getFeeReport,
  updateFeeStatus
} = require('../controllers/studentController');

const Student = require('../models/Student');

// 📊 Dashboard summary routes
router.get('/dashboard', getDashboardStats);
router.get('/total-students', getTotalStudents);
router.get('/total-collected', getTotalFeesCollected);
router.get('/total-pending', getPendingFees);

// 👨‍🎓 Student CRUD routes
router.get('/', getAllStudents);
router.post('/', addStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

// 📅 Fees report & update
router.get('/fee-report', getFeeReport);
router.put('/fees/:id', updateFeeStatus);

// 👥 Student count
router.get('/count', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to count students' });
  }});

module.exports = router;
