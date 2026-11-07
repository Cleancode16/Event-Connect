const { sendVerificationEmail } = require('./mailer');

// Kept for existing imports. Throws if the email could not be sent.
async function sendOrganiserEmail(email, subject, link) {
  return sendVerificationEmail(email, link);
}

module.exports = {
  sendOrganiserEmail
};
