const multer = require('multer');

// Images are kept in memory only long enough to be base64-encoded and saved
// straight into the Book document in MongoDB (no external storage/service).
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  // Kept small on purpose: images are embedded as base64 inside the MongoDB
  // document, and a single document cannot exceed 16MB. 1.5MB/image x 5
  // images keeps a listing safely under that limit.
  limits: { fileSize: 1.5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only .jpg, .png, and .webp images are allowed'));
  },
});

module.exports = upload;
