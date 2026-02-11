const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getUserProfile);
router.route('/update').put(protect, updateUserProfile);

module.exports = router;
