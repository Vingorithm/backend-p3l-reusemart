const express = require('express');
const router = express.Router();
const akunController = require('../controllers/akunController');
const upload = require('../middleware/upload');

router.post('/register', upload.single('profile_picture'), akunController.register);
router.post('/login', akunController.login);
router.put('/change-password/:id', akunController.changePassword);
router.post('/send-verification-email', akunController.sendResetPasswordLink);
router.post('/', akunController.createAkun);
router.get('/', akunController.getAllAkun);
router.get('/:id', akunController.getAkunById);
router.get('/byEmail/:email', akunController.getAkunByEmail);
router.put('/:id', akunController.updateAkun);
router.delete('/:id', akunController.deleteAkun);

module.exports = router;