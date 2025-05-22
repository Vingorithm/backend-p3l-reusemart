const express = require('express');
const router = express.Router();
const penitipanController = require('../controllers/penitipanController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), penitipanController.createPenitipan);
router.get('/', penitipanController.getAllPenitipan);
router.get('/:id', penitipanController.getPenitipanById);
router.get('/byIdBarang/:id_barang', penitipanController.getPenitipanByIdBarang);
router.put('/:id', penitipanController.updatePenitipan);
router.delete('/:id', penitipanController.deletePenitipan);
router.get('/byIdPenitip/:id', penitipanController.getPenitipanByIdPenitip);

module.exports = router;