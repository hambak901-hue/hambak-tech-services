import path from "path";
import fs from "fs";

/* =========================
UPLOAD FILE
========================= */

export const uploadFile = async (req, res) => {
  
  try {
    
    /* CHECK FILE */
    
    if (!req.files || !req.files.file) {
      
      return res.status(400).json({
        
        success: false,
        
        message: "No file uploaded"
        
      });
      
    }
    
    /* GET FILE */
    
    const file = req.files.file;
    
    /* VALIDATE FILE SIZE */
    
    if (file.size > 5 * 1024 * 1024) {
      
      return res.status(400).json({
        
        success: false,
        
        message: "File size exceeds 5MB"
        
      });
      
    }
    
    /* ALLOWED TYPES */
    
    const allowedTypes = [
      
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
      
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      
      return res.status(400).json({
        
        success: false,
        
        message: "Invalid file type"
        
      });
      
    }
    
    /* CREATE UNIQUE FILE NAME */
    
    const fileName =
      `${Date.now()}-${file.name}`;
    
    /* UPLOAD PATH */
    
    const uploadPath =
      path.join(
        process.cwd(),
        "uploads",
        fileName
      );
    
    /* MOVE FILE */
    
    await file.mv(uploadPath);
    
    /* RESPONSE */
    
    res.status(200).json({
      
      success: true,
      
      message: "File uploaded successfully",
      
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
DELETE FILE
========================= */

export const deleteFile = async (req, res) => {
  
  try {
    
    const { filename } = req.params;
    
    /* FILE PATH */
    
    const filePath =
      path.join(
        process.cwd(),
        "uploads",
        filename
      );
    
    /* CHECK FILE */
    
    if (!fs.existsSync(filePath)) {
      
      return res.status(404).json({
        
        success: false,
        
        message: "File not found"
        
      });
      
    }
    
    /* DELETE */
    
    fs.unlinkSync(filePath);
    
    /* RESPONSE */
    
    res.status(200).json({
      
      success: true,
      
      message: "File deleted successfully"
      
    });
    
  } catch (error) {
    
    res.status(500).json({
      
      success: false,
      
      message: error.message
      
    });
    
  }
  
};