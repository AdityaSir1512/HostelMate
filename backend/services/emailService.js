const nodemailer = require('nodemailer');

function hasEmailConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!hasEmailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildMessage({ action, entity, itemName, details = '' }) {
  const subject = `HostelMate update: ${entity} ${action}`;
  const lines = [
    `Hello,`,
    '',
    `Your HostelMate ${entity} was ${action}.`,
  ];

  if (itemName) {
    lines.push(`Item: ${itemName}`);
  }

  if (details) {
    lines.push(`Details: ${details}`);
  }

  lines.push('', 'If you did not expect this update, please review your HostelMate account.', '', 'HostelMate');

  return {
    subject,
    text: lines.join('\n'),
    html: lines.map((line) => `<p>${line || '&nbsp;'}</p>`).join(''),
  };
}

async function sendNotificationEmail(to, payload) {
  if (!to) {
    return { sent: false, reason: 'missing_recipient' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email notification skipped: SMTP configuration is missing');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const { subject, text, html } = buildMessage(payload);
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (error) {
    console.warn('Failed to send notification email:', error.message);
    return { sent: false, reason: 'send_failed', error: error.message };
  }
}

module.exports = {
  sendNotificationEmail,
};
