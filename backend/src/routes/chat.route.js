const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, chatController.handleChat);
router.get('/history', verifyToken, chatController.getChatHistory);

module.exports = router;