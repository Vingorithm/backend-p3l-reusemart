const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // limit file size to 5MB
  }
});

// Log request middleware for debugging
const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.file) {
    console.log('File uploaded:', req.file);
  }
  if (Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
};

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes with logging
router.post('/', logRequest, upload.single('profile_picture'), pegawaiController.createPegawai);
router.get('/', logRequest, pegawaiController.getAllPegawai);
router.get('/:id', logRequest, pegawaiController.getPegawaiById);
router.get('/byIdAkun/:id', logRequest, pegawaiController.getPegawaiByIdAkun);
router.put('/:id', logRequest, upload.single('profile_picture'), pegawaiController.updatePegawai);
router.delete('/:id', logRequest, pegawaiController.deletePegawai);
router.get('/:id/akun', logRequest, pegawaiController.getAkunByPegawaiId);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Something went wrong!',
    path: req.path
  });
});

module.exports = router;