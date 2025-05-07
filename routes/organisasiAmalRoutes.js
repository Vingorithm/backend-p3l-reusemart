const express = require('express');
const router = express.Router();
const organisasiAmalController = require('../controllers/organisasiAmalController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/profile_picture');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // default dulu nama file (id akan ditentukan nanti setelah ambil akun)
    cb(null, `temp${ext}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.none(), organisasiAmalController.createOrganisasiAmal);
router.get('/', organisasiAmalController.getAllOrganisasiAmal);
router.get('/:id', organisasiAmalController.getOrganisasiAmalById);
router.put('/:id', upload.single('profile_picture'), organisasiAmalController.updateOrganisasiAmal);
router.delete('/:id', organisasiAmalController.deleteOrganisasiAmal);
router.get('/byIdAkun/:id', organisasiAmalController.getOrganisasiAmalByAkun);

module.exports = router;