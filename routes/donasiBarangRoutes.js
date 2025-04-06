const express = require('express');
const router = express.Router();
const donasiBarangController = require('../controllers/donasiBarangController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), donasiBarangController.createDonasiBarang);
router.get('/', donasiBarangController.getAllDonasiBarang);
router.get('/:id', donasiBarangController.getDonasiBarangById);
router.put('/:id', donasiBarangController.updateDonasiBarang);
router.delete('/:id', donasiBarangController.deleteDonasiBarang);

module.exports = router;