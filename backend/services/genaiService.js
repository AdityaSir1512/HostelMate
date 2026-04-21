const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const SYSTEM_PROMPT = [
  'You are HostelMate assistant for a student hostel app.',
  'Only answer questions related to HostelMate features: mess menu, complaints, expenses, in/out logs, and profile actions.',
  'If the question is outside these areas, politely redirect user to supported features.',
  'Use provided app context data when relevant and do not invent hostel records.',
  'Keep replies concise and practical in 2-5 sentences.',
].join(' ');

function buildContents(message, options = {}) {
  const history = Array.isArray(options.history) ? options.history : [];
  const appContext = String(options.appContext || '').trim();

  const contents = [];

  if (appContext) {
    contents.push({
      role: 'user',
      parts: [{ text: `Grounding context:\n${appContext}` }],
    });
  }

  history.forEach((item) => {
    contents.push({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.text }],
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  return contents;
}

async function generateChatReply(message, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(
    `${GEMINI_API_BASE_URL}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: buildContents(message, options),
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 220,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    const error = new Error(`Gemini request failed: ${response.status} ${errorBody}`);
    error.statusCode = 502;
    throw error;
  }

  const responseBody = await response.json();
  const reply = responseBody?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join(' ')
    .trim();

  if (!reply) {
    const error = new Error('Model returned an empty response');
    error.statusCode = 502;
    throw error;
  }

  return reply;
}

module.exports = {
  generateChatReply,
};
