const express = require('express');
const router = express.Router();
const alamatPembeliController = require('../controllers/alamatPembeliController');
const multer = require('multer');
const upload = multer();

router.post('/alamat', upload.none(), alamatPembeliController.createAlamatPembeli);
router.get('/', alamatPembeliController.getAllAlamatPembeli);
router.get('/:id', alamatPembeliController.getAlamatPembeliById);
router.put('/:id', alamatPembeliController.updateAlamatPembeli);
router.delete('/:id', alamatPembeliController.deleteAlamatPembeli);

module.exports = router;