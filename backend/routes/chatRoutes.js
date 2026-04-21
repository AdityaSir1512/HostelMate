const express = require('express');
const { createChatReply } = require('../controllers/chatController');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const chatRateLimit = createRateLimit({
	windowMs: Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || 60 * 1000),
	maxRequests: Number(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS || 20),
});

router.post('/', chatRateLimit, createChatReply);

module.exports = router;
