import Contact from "../models/Contact.js";
import { Resend } from "resend";

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export const handleContactSubmit = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    // 1. Save to MongoDB Database Matrix
    const newContact = new Contact({
      name,
      phone,
      email,
      message
    });
    await newContact.save();

    // 2. Dispatch Instant Email Alert via Resend
    await resend.emails.send({
      from: "Hambak Web System <onboarding@resend.dev>", // Replace with your domain email later if verified
      to: "your-email@gmail.com", // Put your actual corporate email here to receive the alerts
      subject: `New Dispatch Received from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email || "Not provided"}</p>
        <p><strong>Message:</strong> ${message}</p>
        <br>
        <p><em>Logged successfully in Hambak Tech Database Systems.</em></p>
      `
    });

    // 3. Return Clean Success Vector to Frontend
    return res.status(200).json({
      success: true,
      message: "Dispatch processed, database synced, and email sent successfully!"
    });

  } catch (error) {
    console.error("Contact Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Matrix Error processing dispatch."
    });
  }
};
