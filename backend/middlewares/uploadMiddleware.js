import multer from 'multer';
import path from 'path';

// Shared disk storage (temp local before Cloudinary)
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// ─── Image Upload (jpeg/jpg/png/webp) ─────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Images only! (jpeg, jpg, png, webp)'));
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

// ─── Resume Upload (PDF only) ─────────────────────────────────────────────────
const resumeFilter = (req, file, cb) => {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Resume must be a PDF file!'));
};

export const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: resumeFilter,
});

// Default export (image) for backward compatibility
export default uploadImage;
