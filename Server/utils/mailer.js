const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Values written in Server/.env. Read directly because dotenv never overrides
// variables that already exist, and USER is already set by the OS/shell
// (Git Bash, macOS, Linux, most hosts) to the login name, not the Gmail address.
const fileEnv = dotenv.config({ path: path.join(__dirname, '..', '.env') }).parsed || {};

const looksLikeEmail = (v) => typeof v === 'string' && v.includes('@');

function readConfig() {
  const user =
    process.env.MAIL_USER ||
    (looksLikeEmail(fileEnv.USER) ? fileEnv.USER : '') ||
    (looksLikeEmail(process.env.USER) ? process.env.USER : '');

  // Gmail shows App Passwords as "abcd efgh ijkl mnop"; the spaces are not part of it
  const pass = (process.env.MAIL_PASS || fileEnv.PASS || process.env.PASS || '').replace(/\s+/g, '');

  const host = process.env.MAIL_HOST || fileEnv.HOST || process.env.HOST || 'smtp.gmail.com';

  // Own port variable: PORT belongs to the Express server
  const port = Number(process.env.MAIL_PORT || fileEnv.MAIL_PORT) || 465;

  // "false" must mean false. Default: TLS on 465, STARTTLS on 587
  const secureRaw = process.env.MAIL_SECURE ?? fileEnv.MAIL_SECURE;
  const secure = secureRaw !== undefined ? String(secureRaw).toLowerCase() === 'true' : port === 465;

  return { user, pass, host, port, secure };
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { user, pass, host, port, secure } = readConfig();
  if (!user || !pass) {
    throw new Error(
      'Mail is not configured: set USER (your Gmail address) and PASS (a Gmail App Password) in Server/.env'
    );
  }
  transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return transporter;
}

// Called once at startup so a bad login shows up in the server console immediately
async function verifyMailer() {
  try {
    const { user, host, port } = readConfig();
    await getTransporter().verify();
    console.log(`Mailer ready: ${user} via ${host}:${port}`);
  } catch (e) {
    console.error('Mailer NOT ready — registration emails will fail:', e.message);
    if (/Invalid login|BadCredentials|535/i.test(e.message)) {
      console.error('Hint: PASS must be a Gmail App Password (Google Account → Security → 2-Step Verification → App passwords).');
    }
  }
}

function verificationHtml(link) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;padding:24px;color:#111">
    <h2 style="margin:0 0 12px">Verify your email</h2>
    <p style="margin:0 0 20px;color:#444">Thanks for joining Event Connect. Confirm your email address to finish creating your account.</p>
    <a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">Verify email</a>
    <p style="margin:24px 0 0;font-size:12px;color:#777">This link expires in 1 hour. If the button doesn't work, open this link:<br><a href="${link}" style="color:#111;word-break:break-all">${link}</a></p>
  </div>`;
}

// Throws on failure so callers can tell the user the truth
async function sendVerificationEmail(to, link) {
  const { user } = readConfig();
  const info = await getTransporter().sendMail({
    from: `"Event Connect" <${user}>`,
    to,
    subject: 'Verify your Event Connect email',
    text: `Verify your email to finish creating your Event Connect account:\n\n${link}\n\nThis link expires in 1 hour.`,
    html: verificationHtml(link),
  });
  console.log(`Verification email sent to ${to} (${info.messageId})`);
  return info;
}

module.exports = { sendVerificationEmail, verifyMailer };
