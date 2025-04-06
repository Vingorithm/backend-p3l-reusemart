const express = require('express');
const router = express.Router();
const pembeliController = require('../controllers/pembeliController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), pembeliController.createPembeli);
router.get('/', pembeliController.getAllPembeli);
router.get('/:id', pembeliController.getPembeliById);
router.put('/:id', pembeliController.updatePembeli);
router.delete('/:id', pembeliController.deletePembeli);

module.exports = router;