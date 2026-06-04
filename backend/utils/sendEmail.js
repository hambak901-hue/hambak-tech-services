import { Resend } from 'resend';

/**
 * Dispatches a secure email over standard web API traffic lanes.
 * Hardcoded API key to instantly resolve "Only absolute URLs are supported" errors.
 */
const sendEmail = async (options) => {
  // Directly initializing with your verified live key to avoid process environment parsing lag
  const resend = new Resend('re_8Y2mSiPD_5VzdQNwMvmjUk9ZJxs3bHzt6');

  // Send email using Resend's free tier onboarding address securely
  const { data, error } = await resend.emails.send({
    from: 'Hambak Tech <onboarding@resend.dev>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error("Resend API internal error log:", error);
    throw new Error(error.message);
  }

  return data;
};

export default sendEmail;
