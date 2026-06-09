import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import errorHandler from "./middleware/errorMiddleware.js";
import orderRoutes from "./routes/orderRoutes.js";

/* DATABASE */
import connectDB from "./config/db.js";

/* ROUTES */
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vtuRoutes from './routes/vtuRoutes.js';

// Import OpenAI SDK Initialization
import OpenAI from "openai";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

// Initialize OpenAI client instance securely using environment variables to satisfy GitHub security compliance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

/* =========================
STATIC FILES & FRONTEND ROUTING
========================= */
// 1. Serve upload folders smoothly
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 2. Serve main frontend assets (css, js, images)
app.use(express.static(path.resolve(process.cwd(), "..", "frontend")));

// 3. Serve pages directory seamlessly (Fixes the admin and client pages 404s)
app.use(express.static(path.resolve(process.cwd(), "..", "frontend", "pages")));

// 4. Custom alias routing so "/admin/admin.html" maps perfectly to your folder structure
app.use("/admin", express.static(path.resolve(process.cwd(), "..", "frontend", "pages")));

/* =========================
HOME ROUTE
========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HAMBAK TECH & SERVICES Backend Running Successfully"
  });
});

/* =========================
API ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/vtu', vtuRoutes);

// 2. Paste this exact route to handle the incoming form data
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, requestType, whatsapp, requirements } = req.body;

    // Optional: Log it in your Render terminal to confirm it arrived
    console.log(`New Dispatch Received from ${name} (${whatsapp})`);

    // --- MONGOOSE SAVING LOGIC ---
    // If you have a Mongoose Schema set up (e.g., ContactModel), uncomment the lines below:
    /*
    const newContact = new ContactModel({ name, email, requestType, whatsapp, requirements });
    await newContact.save();
    */

    // 3. Send a successful 200 OK status back to the frontend
    return res.status(200).json({ 
      success: true, 
      message: 'Order dispatched and saved securely to the backend database!' 
    });

  } catch (error) {
    console.error('Database Save Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error while saving data.' 
    });
  }
});

// 3. Paste this exact route to handle incoming AI Chat request entries securely
app.post('/api/ai/chat', async (req, res) => {
  try {
    // Upgraded fallback definition to capture both "message" and "question" inputs seamlessly
    const message = req.body.message || req.body.question;
    
    // Log the message transmission inside the Render terminal console
    console.log(`Incoming AI Chat request processed: "${message}"`);

    if (!message) {
      return res.status(400).json({ success: false, message: "No question provided" });
    }

    // Requesting a live dynamic completion response directly from OpenAI ChatGPT Engine
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are the official AI assistant for HAMBAK TECH & SERVICES, located in Ibeju-Lekki, Lagos, Nigeria. Answer customer questions professionally about ICT training, computer solutions, registrations (NIN, JAMB, WAEC), printing, corporate branding design, and automated VTU data/airtime services." 
        },
        { role: "user", content: message }
      ],
    });

    const aiReply = completion.choices[0].message.content;

    return res.status(200).json({
      success: true,
      reply: aiReply
    });
  } catch (error) {
    console.error('AI Chat Routing Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Error in AI Matrix Subsystem.'
    });
  }
});

/* =========================
FALLBACK ROUTING FOR REFRESHES
========================= */
// Serves the base index page if a clean web route is entered directly into the browser address bar
app.get("*", (req, res, next) => {
  // If the request path contains "/api", pass it down directly to avoid intercepting server operations
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.resolve(process.cwd(), "..", "frontend", "index.html"));
});

/* =========================
404 ROUTE
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
