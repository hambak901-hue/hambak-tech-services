import path from "path";
import fs from "fs";

/* =========================
UPLOAD FILE VIA MULTIPART FORM
========================= */
export const uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: "Payload processing issue: No document file parsed"
      });
    }

    const file = req.files.file;

    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Payload constraint violation: File exceeds 10MB maximum limit"
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Format error: Use web-compliant PNG, JPEG, WEBP or PDF formats"
      });
    }

    const extension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${extension}`;
    
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, fileName);
    await file.mv(uploadPath);

    res.status(200).json({
      success: true,
      message: "Asset saved clean into storage vectors",
      file: {
        name: fileName,
        path: `/uploads/${fileName}`,
        type: file.mimetype,
        size: file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
DELETE LOCAL ASSET LOGIC
========================= */
export const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), "uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: "Asset unlinked safely from host volumes"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
