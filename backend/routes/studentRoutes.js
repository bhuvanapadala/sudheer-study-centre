// backend/routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getTotalStudents,
  getMonthlyCollected,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getFeeReport,
  updateFeeStatus,
  login
} = require('../controllers/studentController');

router.post('/login', login); 

const Student = require('../models/Student');

// Dashboard summary routes
router.get('/dashboard', getDashboardStats);
router.get('/total-students', getTotalStudents);
router.get('/total-collected',getMonthlyCollected);

// Student CRUD routes
router.get('/', getAllStudents);
router.post('/', addStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

// Add these new report routes at the bottom
router.get('/fee-report', getFeeReport);
router.put('/fees/:id', updateFeeStatus);

// GET student count
router.get('/count', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to count students' });
  }
});

// GET total fees collected
router.get('/fees/collected', async (req, res) => {
  try {
    const students = await Student.find();

    let total = 0;

    students.forEach(student => {
      const monthlyFee = student.monthlyFee || 0;
      const fees = student.fees || {};

      Object.values(fees).forEach(yearData => {
        Object.values(yearData).forEach(month => {
          if (month.paid) total += monthlyFee;
        });
      });
    });

    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating collected fees' });
  }
});



module.exports = router;
