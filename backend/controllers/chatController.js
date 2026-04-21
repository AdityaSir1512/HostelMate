const { generateChatReply } = require('../services/genaiService');
const { buildAppContext } = require('../services/chatContextService');

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      text: String(item.text || '').trim(),
    }))
    .filter((item) => item.text)
    .slice(-8);
}

async function createChatReply(req, res, next) {
  try {
    const message = String(req.body.message || '').trim();
    const history = normalizeHistory(req.body.history);

    if (!message) {
      return res.status(400).json({ message: 'Validation failed', missingFields: ['message'] });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message is too long. Max length is 1000 characters.' });
    }

    let appContext = '';
    try {
      appContext = await buildAppContext();
    } catch (contextError) {
      console.warn('Could not build chat grounding context:', contextError.message);
    }

    const reply = await generateChatReply(message, { history, appContext });

    res.json({ reply, source: 'genai' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createChatReply,
};
