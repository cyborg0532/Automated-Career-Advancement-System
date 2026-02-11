const express = require('express');
const router = express.Router();
const { chatProxy } = require('../controllers/chatController');

router.post('/', chatProxy);

module.exports = router;
