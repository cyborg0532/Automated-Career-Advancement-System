const express = require('express');
const router = express.Router();
const { getDashboardStats, updateDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboardStats);
router.put('/', protect, updateDashboardStats);

module.exports = router;
