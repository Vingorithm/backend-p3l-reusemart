const express = require('express');
const router = express.Router();
const donasiBarangController = require('../controllers/donasiBarangController');

router.post('/', donasiBarangController.createDonasiBarang);
router.get('/', donasiBarangController.getAllDonasiBarang);
router.get('/:id', donasiBarangController.getDonasiBarangById);
router.put('/:id', donasiBarangController.updateDonasiBarang);
router.delete('/:id', donasiBarangController.deleteDonasiBarang);

module.exports = router;