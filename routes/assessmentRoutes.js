const express = require('express');
const router = express.Router();
const { getAssessments, addAssessment, deleteAssessment } = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAssessments);
router.post('/', protect, addAssessment);
router.delete('/:id', protect, deleteAssessment);

module.exports = router;
