const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.single('profile_picture'), pegawaiController.createPegawai);
router.get('/', pegawaiController.getAllPegawai);
router.get('/:id', pegawaiController.getPegawaiById);
router.put('/:id', upload.single('profile_picture'), pegawaiController.updatePegawai);
router.delete('/:id', pegawaiController.deletePegawai);

module.exports = router;