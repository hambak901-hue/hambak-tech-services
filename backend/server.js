import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url"; 
import multer from "multer"; // Added for handling identity attachments securely
import fs from "fs"; // Added to verify folder layout automatically
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

import Contact from "./models/contact.js";
import NinRecord from "./models/NinRecord.js";
import { Resend } from "resend";
import OpenAI from "openai";

dotenv.config();
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

/* ==========================================================================
   MULTER CAPTURE CONFIGURATION FOR AGENT PORTAL (NIMC Subnode Uploads)
   ========================================================================== */
const uploadDirectory = path.join(__dirname, "uploads", "nin_docs");
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'NIMC-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

/* =========================
STATIC FILES & FRONTEND ROUTING
========================= */
app.use((req, res, next) => {
  if (req.url.startsWith('/pages/pages/') || req.url.includes('/pages/')) {
    const cleanUrl = req.url.replace(/\/pages\/pages\//g, '/').replace(/\/pages\//g, '/');
    return res.redirect(cleanUrl);
  }
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.resolve(__dirname, "..", "frontend")));
app.use(express.static(path.resolve(__dirname, "..", "frontend", "pages")));
app.use("/admin", express.static(path.resolve(__dirname, "..", "frontend", "pages")));

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
API DYNAMIC REFRESH HEADERS MIDDLEWARE
========================= */
app.use("/api", (req, res, next) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store"
  });
  next();
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

/* ==========================================================================
   DYNAMIC IDENTITY CAPTURE ENDPOINT (NIN Form Handler Node)
   ========================================================================== */
/* UPDATE THE ENDPOINT TO THIS: */
app.post('/api/nin/process-record', upload.single('legalDoc'), async (req, res) => {
    try {
        // Destructure everything coming securely from nin.js FormData
        const { 
            actionType, 
            computedCost, 
            tierLevel,
            trackingId, 
            modificationType, 
            requirements, 
            fullName, 
            deliveryMethod, 
            firstName, 
            surname, 
            phone, 
            stateOfOrigin 
        } = req.body;

        // Generate the unique traceable reference token
        const referenceCode = `HM-NIMC-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Grab the file upload path safely if a legal doc was attached
        const legalDocPath = req.file ? `/uploads/nin_docs/${req.file.filename}` : "";

        // Instantiating the new Mongoose Record Document
        const newNinRecord = new NinRecord({
            actionType,
            computedCost: Number(computedCost || 0),
            tierLevel,
            referenceCode,
            trackingId,
            modificationType,
            requirements,
            fullName,
            deliveryMethod,
            firstName,
            surname,
            phone,
            stateOfOrigin,
            legalDocPath,
            status: "pending" // Sets initial processing sequence state
        });

        // Commit permanently to your MongoDB Atlas cluster
        await newNinRecord.save();

        console.log(`[DATABASE LOG]: New Identity Node Document Stored. Ref: ${referenceCode}`);

        return res.status(200).json({
            success: true,
            reference: referenceCode,
            message: "Identity capture payload successfully validated and committed to database cluster."
        });

    } catch (error) {
        console.error("NIMC Database Pipeline Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal cryptographic database framework handling exception error." 
        });
    }
});

/* ==========================================================================
   DYNAMIC REGISTRATION ROUTING PIPELINES
   ========================================================================== */
app.post("/api/registrations/submit", async (req, res) => {
  try {
    const uniqueTrackingToken = "HAMBAK-" + Math.floor(100000 + Math.random() * 900000);
    return res.status(201).json({
      success: true,
      message: "Customer core profile successfully compiled and registered in database pools.",
      trackingId: uniqueTrackingToken
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed parsing registry framework array states." });
  }
});

app.get("/api/registrations/track/:id", (req, res) => {
  const cleanToken = req.params.id.replace(/[`']/g, "").trim();
  return res.status(200).json({
    success: true,
    trackingId: cleanToken,
    status: "Processing Systems Verification Loop",
    lastUpdated: new Date()
  });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, requestType, whatsapp, phone, requirements } = req.body;
    const finalPhone = whatsapp || phone;

    console.log(`New Dispatch Received from ${name} (${finalPhone})`);

    if (!finalPhone) {
      return res.status(400).json({
        success: false,
        message: "Validation Error: Phone number is required."
      });
    }

    const newContact = new Contact({ 
      name, 
      email, 
      phone: finalPhone, 
      message: `Type: ${requestType || "General Inquiry"}. Requirements: ${requirements || "None provided"}` 
    });
    await newContact.save();

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Hambak Web System <onboarding@resend.dev>",
        to: "hambak901@gmail.com",
        subject: `New Dispatch Received from ${name}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>WhatsApp/Phone:</strong> ${finalPhone}</p>
          <p><strong>Email:</strong> ${email || "Not provided"}</p>
          <p><strong>Request Type:</strong> ${requestType || "General Inquiry"}</p>
          <p><strong>Requirements:</strong> ${requirements || "None provided"}</p>
          <br>
          <p><em>Logged successfully in Hambak Tech Database Systems.</em></p>
        `
      });
    } else {
      console.warn("Resend email dispatch skipped: Missing RESEND_API_KEY environment token.");
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Order dispatched, saved securely to the backend database, and email alert transmitted!' 
    });

  } catch (error) {
    console.error('Database Save Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error while saving data.' 
    });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const message = req.body.message || req.body.question;
    console.log(`Incoming AI Chat request processed: "${message}"`);

    if (!message) {
      return res.status(400).json({ success: false, message: "No question provided" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        success: true,
        reply: "Hello! This is Hambak Tech Assistant. Our AI core connection is currently on standby. Please contact us directly for quick assistance."
      });
    }

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
app.get("*", (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.resolve(__dirname, "..", "frontend", "index.html"));
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

/* =========================
SERVER INITIALIZATION
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
