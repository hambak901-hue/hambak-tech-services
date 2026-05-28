import multer from "multer";
import path from "path";
import fs from "fs";

/* =========================
CREATE UPLOAD FOLDER
========================= */

const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

/* =========================
STORAGE CONFIG
========================= */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, uploadPath);

  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName +
      path.extname(file.originalname)
    );

  }

});

/* =========================
FILE FILTER
========================= */

const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpg|jpeg|png|webp/;

  const extname =
    allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

  const mimetype =
    allowedTypes.test(file.mimetype);

  if (extname && mimetype) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only image files are allowed"
      )
    );

  }

};

/* =========================
UPLOAD MIDDLEWARE
========================= */

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  }

});

export default upload;