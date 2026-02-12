const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json(user.dashboardStats);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
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
