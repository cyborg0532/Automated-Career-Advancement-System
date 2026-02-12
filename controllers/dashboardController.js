const User = require('../models/User');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch real-time counts
        const studentCount = await Student.countDocuments({ faculty: req.user._id });
        const assessmentCount = await Assessment.countDocuments({ faculty: req.user._id });
        const pendingAssessments = await Assessment.countDocuments({
            faculty: req.user._id,
            status: { $in: ['Pending', 'Upcoming', 'In Progress'] }
        });

        // Aggregate Assessment Types Distribution
        const assessmentTypes = await Assessment.aggregate([
            { $match: { faculty: req.user._id } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        const assessmentLabels = assessmentTypes.length > 0 ? assessmentTypes.map(t => t._id) : ['Exams', 'Quizzes', 'Assignments', 'Projects'];
        const assessmentData = assessmentTypes.length > 0 ? assessmentTypes.map(t => t.count) : [0, 0, 0, 0];

        // Aggregate Subject Performance
        const subjectStats = await Assessment.aggregate([
            { $match: { faculty: req.user._id } },
            { $group: { _id: "$subject", avgScore: { $avg: "$avgScore" } } }
        ]);

        const subjectLabels = subjectStats.length > 0 ? subjectStats.map(s => s._id) : ['Data Structures', 'Algorithms', 'Database', 'OS', 'Networks'];
        const subjectScores = subjectStats.length > 0 ? subjectStats.map(s => Math.round(s.avgScore)) : [0, 0, 0, 0, 0];

        // Combine with user's stored stats (charts)
        const stats = {
            ...user.dashboardStats.toObject(),
            subjects: {
                labels: subjectLabels,
                data: subjectScores
            },
            assessments: {
                labels: assessmentLabels,
                data: assessmentData
            },
            summary: {
                totalStudents: studentCount,
                activeAssessments: assessmentCount,
                pendingTasks: pendingAssessments,
                avgAttendance: 94 // Placeholder for now
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update dashboard stats (For demonstration/future use)
// @route   PUT /api/dashboard
// @access  Private
exports.updateDashboardStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update only fields that are present in the request
            if (req.body.performance) user.dashboardStats.performance = req.body.performance;
            if (req.body.grades) user.dashboardStats.grades = req.body.grades;
            if (req.body.subjects) user.dashboardStats.subjects = req.body.subjects;
            if (req.body.assessments) user.dashboardStats.assessments = req.body.assessments;

            const updatedUser = await user.save();
            res.json(updatedUser.dashboardStats);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
