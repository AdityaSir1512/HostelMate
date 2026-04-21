const rules = [
  {
    keywords: ['mess', 'food', 'menu'],
    response: 'Mess timings are usually 7:00-9:00 AM, 12:30-2:30 PM, and 7:30-9:30 PM. Open Mess Menu screen for today\'s plan.',
  },
  {
    keywords: ['complaint', 'issue', 'problem'],
    response: 'Go to the Complaint screen, fill title + description, then tap Submit. You can also track complaint status there.',
  },
  {
    keywords: ['expense', 'fees', 'money'],
    response: 'Use the Expense screen to add payment-related records. You can see the full list below the form.',
  },
  {
    keywords: ['in', 'out', 'gate', 'entry', 'exit'],
    response: 'Use the In/Out screen to log hostel entry and exit with timestamps.',
  },
  {
    keywords: ['profile', 'logout', 'account'],
    response: 'Open Profile from drawer to see your details or securely logout.',
  },
];

export function getBotReply(message) {
  const normalized = message.toLowerCase();

  const matchedRule = rules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matchedRule) {
    return matchedRule.response;
  }

  return 'I can help with mess menu, complaints, expenses, in/out logs, and profile actions. Try asking one of these.';
}
