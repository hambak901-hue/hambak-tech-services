import nodemailer from "nodemailer";

/**
 * Dispatches a secure email over SMTP lanes using Nodemailer and Gmail.
 * @param {Object} options - Message details containing email target, subject line, and HTML template.
 */
const sendEmail = async (options) => {
  // 1. Establish an explicit connection over Port 587 to bypass cloud firewalls
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Must be false for port 587
    requireTLS: true, // Forces secure upgrade protocols
    auth: {
      user: "hambak901@gmail.com",
      pass: "ehsncrwamomthyfj",
    },
  });

  // 2. Cleanly format the sender string inline to guarantee no syntax truncation occurs
  const mailOptions = {
    from: '"Hambak Tech & Services" <hambak901@gmail.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Dispatch payload package and return execution promise to the controller
  return await transporter.sendMail(mailOptions);
};

export default sendEmail;
