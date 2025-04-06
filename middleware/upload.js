const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // pastikan folder ini ada
  },
  filename: function (req, file, cb) {
    // Gunakan nama temporer dulu, nanti diganti di controller
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
