const express = require('express');
const router = express.Router();

router.use('/alamat-pembeli', require('./alamatPembeliRoutes'));
router.use('/akun', require('./akunRoutes'));
router.use('/pembeli', require('./pembeliRoutes'));
router.use('/organisasi-amal', require('./organisasiAmalRoutes'));
router.use('/pegawai', require('./pegawaiRoutes'));
router.use('/penitip', require('./penitipRoutes'));
router.use('/barang', require('./barangRoutes'));
router.use('/pembelian', require('./pembelianRoutes'));
router.use('/pengiriman', require('./pengirimanRoutes'));
router.use('/transaksi', require('./transaksiRoutes'));
router.use('/review-produk', require('./reviewProdukRoutes'));
router.use('/diskusi-produk', require('./diskusiProdukRoutes'));
router.use('/keranjang', require('./keranjangRoutes'));
router.use('/request-donasi', require('./requestDonasiRoutes'));
router.use('/merchandise', require('./merchandiseRoutes'));
router.use('/claim-merchandise', require('./claimMerchandiseRoutes'));
router.use('/donasi-barang', require('./donasiBarangRoutes'));
router.use('/penitipan', require('./penitipanRoutes'));
router.use('/bonus-top-seller', require('./bonusTopSellerRoutes'));
router.use('/sub-pembelian', require('./subPembelianRoutes'));

module.exports = router;