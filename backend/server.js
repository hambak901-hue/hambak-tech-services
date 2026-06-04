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

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

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
        
