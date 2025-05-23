const express = require('express');
const router = express.Router();
const akunController = require('../controllers/akunController');
// const upload = require('../middleware/upload');

const multer = require('multer');
const path = require('path');

// Konfigurasi multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_picture');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// FCM Token routes
router.post('/fcm-token', akunController.updateFcmToken);
router.get('/fcm-token/:id_akun', akunController.getFcmToken);
router.delete('/fcm-token', akunController.removeFcmToken);

router.post('/register', akunController.register);
router.post('/login', akunController.login);
router.post('/send-verification-email', akunController.sendResetPasswordLink);
router.post('/', akunController.createAkun);
router.get('/', akunController.getAllAkun);
router.get('/:id', akunController.getAkunById);
router.get('/byEmail/:email', akunController.getAkunByEmail);
router.put('/change-password/:id', akunController.changePassword);
router.put('/:id', upload.single('profile_picture'), akunController.updateAkun);
router.delete('/:id', akunController.deleteAkun);

module.exports = router;