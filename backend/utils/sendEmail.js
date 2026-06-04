import nodemailer from "nodemailer";

/**
 * Dispatches a secure email over SMTP lanes using Nodemailer and Gmail.
 * @param {Object} options - Message details containing email target, subject line, and HTML template.
 */
const sendEmail = async (options) => {
  // 1. Establish a unified SMTP transport lane using the correct lowercase service string
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Map structural message configurations into standard mail parameters
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"HAMBAK TECH" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. FIXED: Explicitly return the tracking promise to prevent runtime execution freezes
  return await transporter.sendMail(mailOptions);
};

export default sendEmail;
