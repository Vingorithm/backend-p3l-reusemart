const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage });

router.post('/', upload.single('profile_picture'), pegawaiController.createPegawai);
router.get('/', pegawaiController.getAllPegawai);
router.get('/:id', pegawaiController.getPegawaiById);
router.put('/:id', upload.single('profile_picture'), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    await pegawaiController.updatePegawai(req, res);
});
router.delete('/:id', pegawaiController.deletePegawai);

module.exports = router;