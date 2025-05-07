const express = require('express');
const router = express.Router();
const requestDonasiController = require('../controllers/requestDonasiController');
const multer = require('multer');
const upload = multer();

router.post('/', upload.none(), requestDonasiController.createRequestDonasi);
router.get('/', requestDonasiController.getAllRequestDonasi);
router.get('/:id', requestDonasiController.getRequestDonasiById);
router.put('/:id', requestDonasiController.updateRequestDonasi);
router.delete('/:id', requestDonasiController.deleteRequestDonasi);
router.get('/byIdOrganisasi/:id', requestDonasiController.getRequestDonasiByIdOrganisasi);

module.exports = router;