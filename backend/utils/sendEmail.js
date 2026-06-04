import { Resend } from 'resend';

/**
 * Dispatches a secure email over standard web API traffic lanes to bypass cloud network blocks.
 * @param {Object} options - Message details containing email target, subject line, and HTML template.
 */
const sendEmail = async (options) => {
  // Pulls the secure key directly from Render's dashboard environment configuration lanes
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Send email using a regular secure web HTTP post request (Port 443) which Render allows
  const { data, error } = await resend.emails.send({
    from: 'Hambak Tech <onboarding@resend.dev>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default sendEmail;
