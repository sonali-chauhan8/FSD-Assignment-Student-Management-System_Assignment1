const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long.'],
      maxlength: [100, 'Name cannot exceed 100 characters.']
    },
    enrollmentNumber: {
      type: String,
      required: [true, 'Enrollment number is required.'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Enrollment number must be at least 3 characters long.'],
      maxlength: [30, 'Enrollment number cannot exceed 30 characters.'],
      match: [/^[A-Z0-9-]+$/, 'Enrollment number can only contain letters, numbers, and hyphens.']
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.']
    },
    branch: {
      type: String,
      required: [true, 'Branch is required.'],
      trim: true,
      maxlength: [50, 'Branch cannot exceed 50 characters.']
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required.'],
      min: [1, 'Semester must be between 1 and 8.'],
      max: [8, 'Semester must be between 1 and 8.'],
      validate: {
        validator: Number.isInteger,
        message: 'Semester must be a whole number.'
      }
    },
    section: {
      type: String,
      required: [true, 'Section is required.'],
      trim: true,
      uppercase: true,
      maxlength: [10, 'Section cannot exceed 10 characters.']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);
