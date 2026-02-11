const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileComplete: user.profileComplete,
            profileData: user.profileData
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.profileData) {
            user.profileData = { ...user.profileData, ...req.body.profileData };
        }

        // Calculate profile completion logic could be here, or sent from frontend
        if (req.body.profileComplete) {
            user.profileComplete = req.body.profileComplete;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profileComplete: updatedUser.profileComplete,
            profileData: updatedUser.profileData,
            token: req.headers.authorization.split(' ')[1] // return same token
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
