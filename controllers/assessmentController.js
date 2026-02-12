const Assessment = require('../models/Assessment');

// @desc    Get all assessments for the logged in faculty
// @route   GET /api/assessments
// @access  Private
exports.getAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find({ faculty: req.user._id });
        res.json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new assessment
// @route   POST /api/assessments
// @access  Private
exports.addAssessment = async (req, res) => {
    try {
        const { name, type, subject, date, duration, status } = req.body;

        const assessment = new Assessment({
            name,
            type,
            subject,
            date,
            duration,
            status,
            faculty: req.user._id
        });

        const createdAssessment = await assessment.save();
        res.status(201).json(createdAssessment);
    } catch (error) {
        console.error('Error adding assessment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private
exports.deleteAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);

        if (assessment) {
            if (assessment.faculty.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'User not authorized' });
            }
            await assessment.remove();
            res.json({ message: 'Assessment removed' });
        } else {
            res.status(404).json({ message: 'Assessment not found' });
        }
    } catch (error) {
        console.error('Error deleting assessment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
