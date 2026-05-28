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
STATIC FILES & FRONTEND
========================= */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// This line allows Render to find your HTML files cleanly
app.use(express.static(path.resolve(process.cwd(), "..", "frontend")));

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
