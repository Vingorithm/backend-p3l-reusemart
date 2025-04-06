const express = require('express');
const router = express.Router();
const organisasiAmalController = require('../controllers/organisasiAmalController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), organisasiAmalController.createOrganisasiAmal);
router.get('/', organisasiAmalController.getAllOrganisasiAmal);
router.get('/:id', organisasiAmalController.getOrganisasiAmalById);
router.put('/:id', organisasiAmalController.updateOrganisasiAmal);
router.delete('/:id', organisasiAmalController.deleteOrganisasiAmal);

module.exports = router;