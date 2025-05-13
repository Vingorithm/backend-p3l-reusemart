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
router.get('/byIdPembelian/:id', subPembelianController.getSubPembelianByIdPembelian);
router.get('/byIdPenitip/:id', subPembelianController.getSubPembelianByPenitipId);
router.get('/byIdPembeli/:id', subPembelianController.getSubPembelianByPembeliId);

module.exports = router;