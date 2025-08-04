// backend/controllers/studentController.js
const Student = require('../models/Student');

// Dashboard: Get overall stats
const getDashboardStats = async (req, res) => {
  try {
    const students = await Student.find();
    const totalStudents = students.length;

    let totalCollected = 0;
    let totalPending = 0;

    students.forEach((student) => {
      const fee = student.fee || 0;
      const fees = student.feesPaid || {};

      for (const year in fees) {
        for (const month in fees[year]) {
          if (fees[year][month].paid) totalCollected += fee;
          else totalPending += fee;
        }
      }
    });

    res.json({ totalStudents, totalCollected, totalPending });
  } catch (error) {
    res.status(500).json({ message: 'Dashboard stats failed', error });
  }
};

// Total student count
const getTotalStudents = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get student count' });
  }
};

// Get Monthly Fee Stats
const getMonthlyCollected = async (req, res) => {
  try {
    const year = req.query.year;
    const month = parseInt(req.query.month); // Example: 8 for August

    if (!year || isNaN(month)) {
      return res.status(400).json({ message: "Year or Month missing" });
    }

    const students = await Student.find({});
    let totalCollected = 0;
    let totalPending = 0;

    students.forEach((student) => {
      const monthlyFee = student.monthlyFee || 0;
      const yearData = student.feesPaid?.[year];

      const monthData = yearData?.[month];
      if (monthData?.paid === true) {
        totalCollected += monthlyFee;
      } else {
        totalPending += monthlyFee;
      }
    });

    res.status(200).json({
      collected: totalCollected,
      pending: totalPending,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};





// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Add student
const addStudent = async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    const saved = await newStudent.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Add Failed' });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Update Failed' });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted Successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Delete Failed' });
  }
};

// 🔁 Update Fee Status (PAID/UNPAID)
const updateFeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, month, paid } = req.body;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.feesPaid) student.feesPaid = {};
    if (!student.feesPaid[year]) student.feesPaid[year] = {};

    student.feesPaid[year][month] = {
      paid,
      date: new Date().toISOString().split('T')[0]
    };

    await student.save();
    res.json({ message: 'Fee status updated', student });
  } catch (error) {
    res.status(500).json({ message: 'Error updating fee status', error });
  }
};

// 📊 Generate Fee Report
const getFeeReport = async (req, res) => {
  try {
    const { year } = req.query;
    const students = await Student.find();

    let totalCollected = 0;

    const reports = students.map(student => {
      const paidMonths = [];
      let studentCollected = 0;

      const fees = student.feesPaid?.[year] || {};

      for (const month in fees) {
        if (fees[month].paid) {
          paidMonths.push(month);
          studentCollected += student.fee || 0;
          totalCollected += student.fee || 0;
        }
      }

      return {
        name: student.name,
        class: student.class,
        school: student.school,
        place: student.place,
        monthlyFee: student.fee,
        paidMonths,
        totalPaid: studentCollected
      };
    });

    res.status(200).json({ totalCollected, students: reports });
  } catch (error) {
    res.status(500).json({ message: 'Error generating fee report', error });
  }
};

const jwt = require('jsonwebtoken');

// POST /api/login
const login = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Check if student exists
    const user = await Student.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile number' });
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};






// Export all functions
module.exports = {
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
};
