const express = require('express');
const router = express.Router();
const keranjangController = require('../controllers/keranjangController');
const multer = require('multer');
const upload = multer();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', upload.none(), keranjangController.createKeranjang);
router.get('/', keranjangController.getAllKeranjang);
router.get('/:id', keranjangController.getKeranjangById);
router.get('/byIdPembeli/:id', keranjangController.getKeranjangByIdPembeli);
router.put('/:id', keranjangController.updateKeranjang);
router.delete('/:id', keranjangController.deleteKeranjang);

module.exports = router;