const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Định nghĩa API gửi tin nhắn chat, không cần verifyToken nếu muốn cho khách vãng lai cũng chat được
router.post('/', chatController.handleChat.bind(chatController));

module.exports = router;