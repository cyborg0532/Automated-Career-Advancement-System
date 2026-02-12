const Student = require('../models/Student');

// @desc    Get all students for the logged in faculty
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({ faculty: req.user._id });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new student
// @route   POST /api/students
// @access  Private
exports.addStudent = async (req, res) => {
    try {
        const { name, rollNo, department, year, avgScore } = req.body;

        const student = new Student({
            name,
            rollNo,
            department,
            year,
            avgScore,
            faculty: req.user._id
        });

        const createdStudent = await student.save();
        res.status(201).json(createdStudent);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            if (student.faculty.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized' });
            }
            await student.remove();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
