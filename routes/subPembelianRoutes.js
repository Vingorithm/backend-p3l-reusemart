const express = require('express');
const router = express.Router();
const subPembelianController = require('../controllers/subPembelianController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), subPembelianController.createSubPembelian);
router.get('/', subPembelianController.getAllSubPembelian);
router.get('/:id', subPembelianController.getSubPembelianById);
router.put('/:id', subPembelianController.updateSubPembelian);
router.delete('/:id', subPembelianController.deleteSubPembelian);
router.get('/by-pembelian/:id', subPembelianController.getSubPembelianByIdPembelian);
router.get('/byIdPenitip/:id', subPembelianController.getSubPembelianByPenitipId);
//router.get('/sub-pembelian/by-pembeli/:id_pembeli', subPembelianController.getSubPembelianByPembeliId);

module.exports = router;