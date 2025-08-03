const mongoose = require('mongoose');

// Monthly fee status schema
const feeStatusSchema = new mongoose.Schema({
  paid: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    default: null // Format: "YYYY-MM-DD"
  }
}, { _id: false });

// Main Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  school: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  place: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ""
  },

  // Structure: { 2025: { 1: { paid, date }, 2: {...}, ... }, 2026: {...} }
  feesPaid: {
    type: Map,
    of: {
      type: Map,
      of: feeStatusSchema
    },
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);
