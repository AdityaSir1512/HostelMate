const complaintModel = require('../models/complaintModel');
const expenseModel = require('../models/expenseModel');
const logModel = require('../models/logModel');

function safeString(value, fallback = 'N/A') {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value);
}

function takeRecent(list, count = 3) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.slice(0, count);
}

async function buildAppContext() {
  const [complaints, expenses, logs] = await Promise.all([
    complaintModel.list(),
    expenseModel.list(),
    logModel.list(),
  ]);

  const recentComplaints = takeRecent(complaints).map((item) =>
    `- ${safeString(item.title)} (status: ${safeString(item.status, 'open')})`
  );

  const recentExpenses = takeRecent(expenses).map((item) =>
    `- ${safeString(item.item)}: ${safeString(item.amount)}`
  );

  const recentLogs = takeRecent(logs).map((item) =>
    `- ${safeString(item.type)} at ${safeString(item.timestamp)}`
  );

  return [
    `Complaints count: ${complaints.length}`,
    'Recent complaints:',
    ...(recentComplaints.length ? recentComplaints : ['- None']),
    `Expenses count: ${expenses.length}`,
    'Recent expenses:',
    ...(recentExpenses.length ? recentExpenses : ['- None']),
    `In/Out logs count: ${logs.length}`,
    'Recent in/out logs:',
    ...(recentLogs.length ? recentLogs : ['- None']),
  ].join('\n');
}

module.exports = {
  buildAppContext,
};
