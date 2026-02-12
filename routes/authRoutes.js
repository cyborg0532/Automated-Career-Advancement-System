const express = require('express');
const router = express.Router();
const { registerUser, authUser, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', authUser);
router.put('/change-password', protect, changePassword);

module.exports = router;
