const express = require('express');
const router = express.Router();

router.use('/akun', require('./akunRoutes'));

module.exports = router;