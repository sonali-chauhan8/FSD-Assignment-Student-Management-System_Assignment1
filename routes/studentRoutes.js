const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');

const router = express.Router();

// Escape special regex characters in user search input
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Format Mongoose validation/duplicate errors into a clean message
function handleMongooseError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A student with this enrollment number already exists.'
    });
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Invalid student data provided.',
      errors: messages
    });
  }

  console.error('Database Error:', error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error. Please try again.'
  });
}

// GET /api/students - Fetch all students (supports ?search=name_or_enrollment)
router.get('/', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const filter = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: regex }, { enrollmentNumber: regex }];
    }

    const [students, totalCount] = await Promise.all([
      Student.find(filter).sort({ createdAt: -1 }),
      Student.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      count: students.length,
      totalCount,
      data: students
    });
  } catch (error) {
    return handleMongooseError(res, error);
  }
});

// GET /api/students/:id - Fetch a single student by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    return handleMongooseError(res, error);
  }
});

// POST /api/students - Add a new student
router.post('/', async (req, res) => {
  try {
    const { name, enrollmentNumber, email, branch, semester, section } = req.body;
    const normalizedEnrollment = (enrollmentNumber || '').trim().toUpperCase();

    if (normalizedEnrollment) {
      const existing = await Student.findOne({ enrollmentNumber: normalizedEnrollment });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Enrollment number "${normalizedEnrollment}" already exists.`
        });
      }
    }

    const student = await Student.create({
      name,
      enrollmentNumber: normalizedEnrollment,
      email,
      branch,
      semester: semester !== undefined && semester !== '' ? Number(semester) : undefined,
      section
    });

    return res.status(201).json({
      success: true,
      message: 'Student record added successfully.',
      data: student
    });
  } catch (error) {
    return handleMongooseError(res, error);
  }
});

// PUT /api/students/:id - Update an existing student
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    const { name, enrollmentNumber, email, branch, semester, section } = req.body;
    const normalizedEnrollment = (enrollmentNumber || '').trim().toUpperCase();

    if (normalizedEnrollment) {
      const duplicate = await Student.findOne({
        enrollmentNumber: normalizedEnrollment,
        _id: { $ne: req.params.id }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Enrollment number "${normalizedEnrollment}" is already assigned to another student.`
        });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name,
        enrollmentNumber: normalizedEnrollment,
        email,
        branch,
        semester: semester !== undefined && semester !== '' ? Number(semester) : undefined,
        section
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      data: updatedStudent
    });
  } catch (error) {
    return handleMongooseError(res, error);
  }
});

// DELETE /api/students/:id - Delete a student
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student record deleted successfully.',
      data: deletedStudent
    });
  } catch (error) {
    return handleMongooseError(res, error);
  }
});

module.exports = router;
