const express = require('express');
const router = express.Router();
const pembeliController = require('../controllers/pembeliController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), pembeliController.createPembeli);
router.get('/', pembeliController.getAllPembeli);
router.get('/:id', pembeliController.getPembeliById);
router.get('/byIdAkun/:id', pembeliController.getPembeliByAkunId);
router.put('/:id', pembeliController.updatePembeli);
router.delete('/:id', pembeliController.deletePembeli);
router.put('/:id/poin', pembeliController.updatePoinPembeli);


module.exports = router;